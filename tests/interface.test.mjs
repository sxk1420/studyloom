/**
 * Interaction logic tests using the actual HTML and application module.
 * jsdom does not render CSS, implement native modal focus trapping, or supply
 * real visibility events. Those still need the manual browser checklist.
 */
import {test, beforeEach, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM, VirtualConsole} from 'jsdom';
import {STORAGE_KEY,encodePlan} from '../src/storage.mjs';
import {defaults} from '../src/engine.mjs';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
let dom, $, now, interval, errors, saved, sequence=0;
const globalNames=['document','FormData','performance','setInterval'];

beforeEach(async()=>{
 saved=Object.fromEntries(globalNames.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 await mount();
});
async function mount(seed=null){
 if(dom)dom.window.close();
 now=0;errors=[];
 const console=new VirtualConsole();console.on('jsdomError',error=>errors.push(error));
 dom=new JSDOM(html,{url:'http://localhost:5173',pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window;
 if(seed!==null)w.localStorage.setItem(STORAGE_KEY,seed);
 // Deliberate test shims: verify state transitions, not native modal behaviour.
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 Object.defineProperty(globalThis,'document',{value:w.document,configurable:true});
 Object.defineProperty(globalThis,'FormData',{value:w.FormData,configurable:true});
 Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
 Object.defineProperty(globalThis,'setInterval',{value:callback=>{interval=callback;return 1;},configurable:true});
 $=selector=>w.document.querySelector(selector);
 // Each test gets a fresh module instance and independent application state.
 await import(new URL(`../src/app.mjs?test=${++sequence}`,import.meta.url));
}
afterEach(()=>{
 dom.window.close();
 for(const name of globalNames){if(saved[name])Object.defineProperty(globalThis,name,saved[name]);else delete globalThis[name];}
 assert.deepEqual(errors,[], 'No unhandled interface errors');
});
// Explicit focus approximates keyboard activation without claiming key-event coverage.
function activate(selector){const control=$(selector);assert.ok(control,selector);assert.ok(!control.disabled,`${selector} is enabled`);control.focus();control.click();}
function change(selector,value,event='change'){$(selector).value=String(value);$(selector).dispatchEvent(new dom.window.Event(event,{bubbles:true}));}
function task(id){return $(`#tasks [data-id="${id}"][data-action="edit"]`).closest('article');}
function edit(id,fields){activate(`#tasks [data-id="${id}"][data-action="edit"]`);for(const [key,value] of Object.entries(fields))$('#task-form').elements[key].value=value;$('#task-form button[type="submit"]').click();}
function finish(){activate('#start');activate('#finish');}
function preview(){activate('#review-form button[type="submit"]');}
function remaining(value){change('#review-remaining',value,'input');}
function visible(hidden){Object.defineProperty(document,'hidden',{value:hidden,configurable:true});document.dispatchEvent(new dom.window.Event('visibilitychange'));}

test('initial plan and short-session demo show accurate totals',()=>{
 assert.deepEqual([...document.querySelectorAll('.metrics strong')].map(n=>n.textContent),['50 min','5 min','5 min']);
 activate('[data-demo="overload"]');assert.match($('.notice').textContent,/75 minutes/);assert.equal($('.block-title span').textContent,'20 min');
});
test('preference switches actual task order and explicit override still wins',()=>{
 edit(1,{days:0,confidence:3});edit(2,{days:1,confidence:1});activate('[data-id="3"][data-action="exclude"]');
 assert.match($('.block-title').textContent,/Draft interaction/);change('#mode','deadlines');assert.match($('.block-title').textContent,/Revise recursion/);
 activate('[data-id="2"][data-action="pin"]');assert.match($('.block-title').textContent,/Draft interaction/);
});
test('adaptation feedback reflects manual changes and undo',()=>{
 activate('#sim-example');activate('#accept');assert.equal($('#cap').value,'15');change('#cap',25);
 assert.match($('#suggestion').textContent,/Current maximum: 25/);activate('#undo');assert.equal($('#cap').value,'15');assert.match($('#suggestion').textContent,/Current maximum: 15/);
});
test('rejecting adaptation leaves settings unchanged',()=>{
 activate('#sim-example');activate('#reject');assert.equal($('#cap').value,'25');assert.match($('#suggestion').textContent,/rejected/);
});
test('task actions preserve focus and deletion chooses a useful fallback',()=>{
 for(const action of ['pin','exclude','done']){activate(`[data-id="2"][data-action="${action}"]`);assert.equal(document.activeElement.dataset.action,action);assert.equal(document.activeElement.dataset.id,'2');}
 activate('[data-id="2"][data-action="remove"]');assert.equal(document.activeElement.dataset.id,'3');
 activate('[data-id="3"][data-action="remove"]');assert.equal(document.activeElement.dataset.id,'1');
 activate('[data-id="1"][data-action="remove"]');assert.equal(document.activeElement.id,'add');assert.equal($('#start').disabled,true);
});
test('saving literal HTML does not create markup and focuses Edit',()=>{
 edit(1,{title:'<b>My task</b>'});assert.match(task(1).textContent,/<b>My task<\/b>/);assert.equal(task(1).querySelector('b'),null);assert.equal(document.activeElement.dataset.action,'edit');
});
test('invalid budget restores the previous setting',()=>{
 change('#budget',0);assert.equal($('#budget').value,'60');assert.match($('#status').textContent,/not applied/);
});
test('timer selection survives changes while the selected task remains scheduled',()=>{
 change('#session-task',2);change('#mode','deadlines');assert.equal($('#session-task').value,'2');change('#cap',15);assert.equal($('#session-task').value,'2');
 activate('[data-id="2"][data-action="exclude"]');assert.notEqual($('#session-task').value,'2');
});
test('timer pauses, resumes and finishes without implicitly completing work',()=>{
 activate('#start');now=10000;interval();assert.equal($('#timer').textContent,'00:10');activate('#pause');now=40000;interval();assert.equal($('#timer').textContent,'00:10');activate('#pause');now=45000;interval();assert.equal($('#timer').textContent,'00:15');activate('#finish');
 assert.match(task(1).textContent,/30 min estimated/);assert.doesNotMatch(task(1).querySelector('h3').textContent,/Complete/);assert.match($('#suggestion').textContent,/Observation was off/);
});
test('synthetic visibility signals trigger the live-path suggestion after threshold',()=>{
 $('#observe').checked=true;activate('#start');
 for(let i=0;i<3;i++){now+=10000;visible(true);now+=10000;visible(false);}
 now=300000;activate('#finish');assert.match($('#observations').textContent,/Live observation/);assert.ok($('#accept'));assert.equal($('#review-block').hidden,false);
});
test('automatic timer completion makes review available',()=>{
 change('#budget',5);activate('#start');now=300000;interval();assert.equal($('#finish').disabled,true);assert.equal($('#review-block').hidden,false);assert.match($('#timer-state').textContent,/duration reached/);
});
test('review preview and cancel leave estimates unchanged',()=>{
 finish();activate('#review-block');remaining(10);preview();assert.match($('#review-preview').textContent,/10 minutes still remaining/);assert.match(task(1).textContent,/30 min estimated/);activate('#cancel-review');assert.match(task(1).textContent,/30 min estimated/);
});
test('applying progress updates the estimate and undo restores it',()=>{
 finish();activate('#review-block');remaining(10);preview();activate('#apply-review');assert.match(task(1).textContent,/10 min estimated/);assert.equal(document.activeElement.id,'undo');activate('#undo');assert.match(task(1).textContent,/30 min estimated/);
});
test('finished review requires apply and completion is undoable',()=>{
 finish();activate('#review-block');change('#review-outcome','finished');preview();assert.doesNotMatch(task(1).querySelector('h3').textContent,/Complete/);activate('#apply-review');assert.match(task(1).querySelector('h3').textContent,/Complete/);activate('#undo');assert.doesNotMatch(task(1).querySelector('h3').textContent,/Complete/);
});
test('changing review input invalidates the preview and supports more work',()=>{
 finish();activate('#review-block');remaining(10);preview();remaining(60);assert.equal($('#apply-review').hidden,true);change('#review-outcome','more-time');preview();activate('#apply-review');assert.match(task(1).textContent,/60 min estimated/);
});
test('invalid remaining work cannot be applied',()=>{
 finish();activate('#review-block');remaining(0);preview();assert.equal($('#apply-review').hidden,true);assert.match(task(1).textContent,/30 min estimated/);
});
test('removed active task cannot accidentally review a replacement',()=>{
 activate('#start');activate('[data-id="1"][data-action="remove"]');activate('#finish');assert.equal($('#review-block').hidden,true);
});
test('simulated example cannot modify task progress through live review',()=>{
 activate('#sim-example');assert.match($('#observations').textContent,/SIMULATED EXAMPLE/);assert.equal($('#review-block').hidden,true);
});
test('forget removes evidence, decisions, review access and undo',()=>{
 finish();activate('#clear');assert.equal($('#review-block').hidden,true);assert.equal($('#undo').disabled,true);assert.match($('#observations').textContent,/No observations/);assert.equal($('#suggestion').textContent,'');
});


test('saving is opt-in and stores only tasks and planning settings',()=>{
 assert.equal(dom.window.localStorage.getItem(STORAGE_KEY),null);activate('#sim-example');activate('#accept');activate('#save-plan');
 const saved=JSON.parse(dom.window.localStorage.getItem(STORAGE_KEY));assert.equal(saved.plan.cap,15);assert.equal(saved.latestObservation,undefined);assert.equal(saved.decision,undefined);assert.match($('#save-status').textContent,/matches/);
});
test('saved copy survives a new page and requires explicit restore',async()=>{
 edit(1,{title:'My saved task'});activate('#save-plan');const copy=dom.window.localStorage.getItem(STORAGE_KEY);await mount(copy);
 assert.match(task(1).textContent,/Revise recursion/);assert.equal($('#restore-plan').disabled,false);activate('#restore-plan');assert.match(task(1).textContent,/My saved task/);
});
test('later edits do not autosave and restore supports undo',()=>{
 activate('#save-plan');edit(1,{title:'Unsaved edit'});assert.match($('#save-status').textContent,/differs/);assert.equal(JSON.parse(dom.window.localStorage.getItem(STORAGE_KEY)).plan.tasks[0].title,'Revise recursion');
 activate('#restore-plan');assert.match(task(1).textContent,/Revise recursion/);activate('#undo');assert.match(task(1).textContent,/Unsaved edit/);
});
test('deleting saved data leaves current tasks but removes it across reloads',async()=>{
 edit(1,{title:'Keep current task'});activate('#save-plan');activate('#delete-plan');assert.match(task(1).textContent,/Keep current task/);assert.equal(dom.window.localStorage.getItem(STORAGE_KEY),null);
 await mount();assert.equal($('#restore-plan').disabled,true);assert.match($('#save-status').textContent,/Not saved/);
});
test('corrupt saved data is not restored and can be deleted',async()=>{
 await mount('{broken');assert.match($('#save-status').textContent,/unreadable/);assert.equal($('#restore-plan').disabled,true);assert.match(task(1).textContent,/Revise recursion/);activate('#delete-plan');assert.equal(dom.window.localStorage.getItem(STORAGE_KEY),null);
});
test('storage write failure is reported without losing the current plan',()=>{
 dom.window.Storage.prototype.setItem=function(){throw Error('Quota exceeded');};activate('#save-plan');assert.match($('#save-status').textContent,/Saving failed/);assert.match(task(1).textContent,/Revise recursion/);
});
test('restoring is disabled during a live block and allowed after finish',()=>{
 activate('#save-plan');activate('#start');assert.equal($('#restore-plan').disabled,true);activate('#finish');assert.equal($('#restore-plan').disabled,false);
});
test('forget observations does not delete explicitly saved tasks',()=>{
 activate('#save-plan');activate('#sim-example');activate('#clear');assert.ok(dom.window.localStorage.getItem(STORAGE_KEY));assert.equal($('#restore-plan').disabled,false);
});
test('other-tab deletion updates saved status without changing current tasks',()=>{
 activate('#save-plan');dom.window.localStorage.removeItem(STORAGE_KEY);dom.window.dispatchEvent(new dom.window.StorageEvent('storage',{key:STORAGE_KEY}));assert.equal($('#restore-plan').disabled,true);assert.match(task(1).textContent,/Revise recursion/);
});

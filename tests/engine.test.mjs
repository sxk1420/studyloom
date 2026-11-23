import {test} from 'node:test';import assert from 'node:assert/strict';import {defaults,plan,infer,createClock,advance,visibility,pause,resume} from '../src/engine.mjs';
test('balanced hour accounts for study, break and unused time',()=>{const p=plan(defaults());assert.deepEqual([p.study,p.breaks,p.unused,p.remaining],[50,5,5,45]);});
test('20-minute session exposes unfinished work',()=>{const p=plan({...defaults(),budget:20});assert.equal(p.study,20);assert.equal(p.remaining,75);});
test('explicit priority overrides score',()=>{const s=defaults();s.tasks[2].pinned=true;assert.equal(plan(s).blocks[0].id,3);});
test('completed and excluded tasks are omitted',()=>{const s=defaults();s.tasks[0].done=true;s.tasks[1].excluded=true;assert.equal(plan(s).study,20);});
test('empty list uses no time',()=>assert.equal(plan({...defaults(),tasks:[]}).unused,60));
test('rejects invalid inputs and duplicate IDs',()=>{for(const budget of [0,4,241,10.2,NaN])assert.throws(()=>plan({...defaults(),budget}));const s=defaults();s.tasks[1].id=1;assert.throws(()=>plan(s));});
test('every budget and cap preserves time and allocation invariants',()=>{for(let budget=5;budget<=240;budget++)for(const cap of [15,25]){const p=plan({...defaults(),budget,cap});assert.equal(p.study+p.breaks+p.unused,budget);assert.ok(p.remaining>=0);assert.notEqual(p.blocks.at(-1)?.kind,'break');assert.ok(p.blocks.every(b=>b.minutes>=5&&b.minutes<=cap));const ids=p.blocks.filter(b=>b.kind==='task').map(b=>b.id);assert.equal(new Set(ids).size,ids.length);}});
test('insufficient observation abstains even with many departures',()=>assert.equal(infer({elapsedMs:299999,switches:10,hiddenMs:120000}).suggest,false));
test('adaptation respects exact threshold boundaries',()=>{assert.equal(infer({elapsedMs:300000,switches:3,hiddenMs:0}).suggest,true);assert.equal(infer({elapsedMs:300000,switches:2,hiddenMs:119999}).suggest,false);assert.equal(infer({elapsedMs:300000,switches:0,hiddenMs:120000}).suggest,true);});
test('timer excludes pauses and counts page departures once',()=>{const c=createClock(0,true);visibility(c,true,1000);visibility(c,true,2000);visibility(c,false,4000);pause(c,5000);advance(c,10000);resume(c,11000);advance(c,12000);assert.deepEqual([c.elapsedMs,c.hiddenMs,c.switches,c.pauses],[6000,3000,1,1]);});
test('observation off collects no hidden time or departures',()=>{const c=createClock(0,false);visibility(c,true,1000);advance(c,5000);assert.equal(c.hiddenMs,0);assert.equal(c.switches,0);});
test('departures during manual pause are not counted',()=>{const c=createClock(0,true);pause(c,1000);visibility(c,true,2000);assert.equal(c.switches,0);assert.equal(c.hiddenMs,0);});

test('planning preference changes order for a real urgency-confidence tradeoff',()=>{
 const state={...defaults(),tasks:[
  {id:1,title:'Confident task due today',minutes:25,days:0,confidence:3},
  {id:2,title:'Uncertain task due tomorrow',minutes:25,days:1,confidence:1}
 ]};
 assert.deepEqual(plan(state).ranked.map(t=>t.id),[2,1]);
 assert.deepEqual(plan({...state,mode:'deadlines'}).ranked.map(t=>t.id),[1,2]);
 state.tasks[1].pinned=true;
 assert.equal(plan({...state,mode:'deadlines'}).ranked[0].id,2);
});

test('review previews progress without mutating the current plan',async()=>{
 const {reviewTask}=await import('../src/engine.mjs');const s=defaults();const before=structuredClone(s);
 const preview=reviewTask(s,1,'progress',10);
 assert.deepEqual(s,before);assert.equal(preview.state.tasks[0].minutes,10);
 assert.equal(preview.plan.blocks[0].minutes,10);
});
test('finished review removes task from scheduling but retains it for reopening',async()=>{
 const {reviewTask}=await import('../src/engine.mjs');const p=reviewTask(defaults(),1,'finished');
 assert.equal(p.state.tasks[0].done,true);assert.equal(p.state.tasks[0].minutes,30);
 assert.ok(p.plan.ranked.every(t=>t.id!==1));
});
test('need-more-time review supports increased estimates and rejects invalid reviews',async()=>{
 const {reviewTask}=await import('../src/engine.mjs');const s=defaults();
 assert.equal(reviewTask(s,1,'more-time',60).state.tasks[0].minutes,60);
 for(const n of [0,4,241,5.5,NaN])assert.throws(()=>reviewTask(s,1,'progress',n));
 assert.throws(()=>reviewTask(s,999,'finished'));assert.throws(()=>reviewTask(s,1,'unknown',10));
});

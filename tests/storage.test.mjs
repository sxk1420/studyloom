import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults} from '../src/engine.mjs';
import {cleanPlan,encodePlan,decodePlan} from '../src/storage.mjs';

test('saved plans round-trip tasks, flags and settings',()=>{
 const state=defaults();state.tasks[0].pinned=true;state.tasks[1].excluded=true;state.tasks[2].done=true;
 const decoded=decodePlan(encodePlan(state,new Date('2026-11-23T12:00:00Z')));
 assert.deepEqual(decoded.plan,cleanPlan(state));assert.equal(decoded.savedAt,'2026-11-23T12:00:00.000Z');
});
test('saved data whitelists fields and never persists observations or inferred decisions',()=>{
 const state={...defaults(),observations:{hiddenMs:100},decision:'accepted',clock:{running:true}};state.tasks[0].privateNote='not a plan field';
 const parsed=JSON.parse(encodePlan(state));assert.deepEqual(Object.keys(parsed),['version','savedAt','plan']);assert.deepEqual(Object.keys(parsed.plan),['budget','cap','mode','tasks']);assert.equal(parsed.plan.tasks[0].privateNote,undefined);
});
test('malformed versions, timestamps, task flags and duplicate IDs are rejected',()=>{
 for(const raw of ['not json','null',JSON.stringify({version:2}),JSON.stringify({version:1,savedAt:'invalid',plan:defaults()})])assert.throws(()=>decodePlan(raw));
 const state=defaults();state.tasks[0].done='false';assert.throws(()=>encodePlan(state));delete state.tasks[0].done;state.tasks[1].id=1;assert.throws(()=>encodePlan(state));
});
test('excessive payloads and ambiguous first priorities are rejected',()=>{
 assert.throws(()=>decodePlan(' '.repeat(250001)));const state=defaults();state.tasks[0].pinned=true;state.tasks[1].pinned=true;assert.throws(()=>encodePlan(state));
});
test('relative deadlines are preserved without inventing new dates',()=>{
 const state=defaults();assert.deepEqual(decodePlan(encodePlan(state)).plan.tasks.map(t=>t.days),[1,3,7]);
});

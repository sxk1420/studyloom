import {validate} from './engine.mjs';
export const STORAGE_KEY='studyloom.saved-plan.v1';

// Whitelist plan data so observations, timers and inferred decisions never persist.
export function cleanPlan(input){
 if(!input||!Array.isArray(input.tasks)||input.tasks.length>200)throw Error('Saved plan must contain at most 200 tasks.');
 const tasks=input.tasks.map(t=>{
  if(!t||typeof t!=='object')throw Error('Invalid saved task.');
  for(const flag of ['pinned','done','excluded'])if(t[flag]!==undefined&&typeof t[flag]!=='boolean')throw Error('Invalid saved task flag.');
  return {id:t.id,title:t.title,minutes:t.minutes,days:t.days,confidence:t.confidence,pinned:!!t.pinned,done:!!t.done,excluded:!!t.excluded};
 });
 if(tasks.filter(t=>t.pinned).length>1)throw Error('Saved plan has multiple first priorities.');
 const state={budget:input.budget,cap:input.cap,mode:input.mode,tasks};validate(state);return state;
}
export function encodePlan(state,now=new Date()){
 return JSON.stringify({version:1,savedAt:now.toISOString(),plan:cleanPlan(state)});
}
export function decodePlan(raw){
 if(typeof raw!=='string'||raw.length>250000)throw Error('Saved plan is too large or unreadable.');
 const data=JSON.parse(raw);
 if(data?.version!==1||typeof data.savedAt!=='string'||!Number.isFinite(Date.parse(data.savedAt)))throw Error('Saved plan format is unsupported.');
 return {version:1,savedAt:data.savedAt,plan:cleanPlan(data.plan)};
}

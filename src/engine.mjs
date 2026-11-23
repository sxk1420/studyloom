// Design heuristics, not validated measures of ability, attention or learning.
export const defaults=()=>({budget:60,cap:25,mode:'balanced',tasks:[{id:1,title:'Revise recursion',minutes:30,days:1,confidence:1},{id:2,title:'Draft interaction design report',minutes:45,days:3,confidence:2},{id:3,title:'Review database notes',minutes:20,days:7,confidence:3}]});
export function validate(state){
 if(!Number.isInteger(state.budget)||state.budget<5||state.budget>240)throw Error('Available time must be a whole number from 5 to 240.');
 if(![15,25].includes(state.cap)||!['balanced','deadlines'].includes(state.mode))throw Error('Invalid planning setting.');
 const ids=new Set();
 for(const t of state.tasks){if(!Number.isInteger(t.id)||ids.has(t.id)||typeof t.title!=='string'||!t.title.trim()||t.title.length>100||!Number.isInteger(t.minutes)||t.minutes<5||t.minutes>240||!Number.isInteger(t.days)||t.days< -30||t.days>365||![1,2,3].includes(t.confidence))throw Error('Check task name, duration (5–240), due days (−30–365) and confidence.');ids.add(t.id);}
}
export function plan(state){validate(state);const weight=state.mode==='deadlines'?3:1;
 const ranked=state.tasks.filter(t=>!t.excluded&&!t.done).map(t=>{const urgency=t.days<=0?6:t.days===1?5:t.days<=3?3:1;const support=4-t.confidence;return {...t,urgency,support,score:weight*urgency+support};}).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||b.score-a.score||a.days-b.days||a.id-b.id);
 let left=state.budget;const blocks=[];
 for(const t of ranked){if(left<5)break;if(blocks.length){if(left<10)break;blocks.push({kind:'break',minutes:5});left-=5;}const minutes=Math.min(left,state.cap,t.minutes);blocks.push({...t,kind:'task',estimate:t.minutes,minutes});left-=minutes;}
 const study=blocks.filter(b=>b.kind==='task').reduce((a,b)=>a+b.minutes,0);const total=ranked.reduce((a,b)=>a+b.minutes,0);
 return {ranked,blocks,study,breaks:state.budget-left-study,unused:left,remaining:total-study};
}
export function infer(observation){
 // At least five observed minutes prevents a suggestion from a tiny sample.
 const enough=observation.elapsedMs>=300000;
 const interrupted=observation.switches>=3||observation.hiddenMs>=120000;
 return {suggest:enough&&interrupted,reason:!enough?'There is less than five minutes of observation. No adaptation proposed.':!interrupted?'The observation threshold was not reached. No adaptation proposed.':'Frequent page changes or time away may mean a shorter block would suit this session.',threshold:'At least 5 elapsed minutes, plus 3 page departures or 2 minutes hidden.'};
}
export function createClock(now,observing=false){return {status:'running',observing,last:now,elapsedMs:0,hiddenMs:0,switches:0,pauses:0,hidden:false};}
export function advance(clock,now){const dt=Math.max(0,now-clock.last);if(clock.status==='running'){clock.elapsedMs+=dt;if(clock.observing&&clock.hidden)clock.hiddenMs+=dt;}clock.last=now;}
export function visibility(clock,hidden,now){advance(clock,now);if(clock.observing&&clock.status==='running'&&hidden&&!clock.hidden)clock.switches++;clock.hidden=hidden;}
export function pause(clock,now){advance(clock,now);if(clock.status==='running'){clock.status='paused';clock.pauses++;}}
export function resume(clock,now){clock.last=now;clock.status='running';}

// Reviews are explicit user estimates. Timer duration never implies progress.
export function reviewTask(state, taskId, outcome, remaining) {
 validate(state);
 const next=structuredClone(state);
 const task=next.tasks.find(t=>t.id===taskId);
 if(!task)throw Error('This task no longer exists. Review your task list instead.');
 if(!['finished','progress','more-time'].includes(outcome))throw Error('Choose a review outcome.');
 if(outcome==='finished')task.done=true;
 else {
  if(!Number.isInteger(remaining)||remaining<5||remaining>240)throw Error('Remaining work must be 5–240 whole minutes, or choose Finished.');
  task.minutes=remaining;task.done=false;
 }
 return {state:next,plan:plan(next)};
}

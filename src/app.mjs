import {STORAGE_KEY,encodePlan,decodePlan,cleanPlan} from './storage.mjs';
import {defaults,plan,reviewTask,infer,createClock,advance,visibility,pause,resume} from './engine.mjs';
const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=defaults(),previous=null,editing=null,clock=null,observation=null,decision=null,activeTask=null,result;
let reviewTarget=null,reviewDraft=null,reviewBase=null;
let savedSnapshot=null,savedRawExists=false,storageError='';
const say=t=>$('#status').textContent=t;
function checkpoint(){previous={state:structuredClone(state),decision};$('#undo').disabled=false;}
function active(){return clock&&['running','paused'].includes(clock.status);}
function format(ms){const s=Math.floor(ms/1000);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function render(){
 const selectedTask=$('#session-task').value;
 const focused=document.activeElement;
 const taskFocus=focused?.closest('#tasks [data-action]');
 const focusId=taskFocus?.dataset.id;
 const focusAction=taskFocus?.dataset.action;
 const oldIds=[...document.querySelectorAll('#tasks [data-action="edit"]')].map(b=>b.dataset.id);
 const oldIndex=oldIds.indexOf(focusId);
 result=plan(state);$('#budget').value=state.budget;$('#cap').value=state.cap;$('#mode').value=state.mode;$('#count').textContent=`${state.tasks.length} TASKS`;
 $('#tasks').innerHTML=state.tasks.map(t=>`<article class="task ${t.done||t.excluded?'inactive':''}"><h3>${esc(t.title)} ${t.done?'· Complete':t.excluded?'· Left out':''}</h3><div class="task-meta"><span>${t.minutes} min estimated</span><span>${t.days<0?`${-t.days} day(s) overdue`:t.days===0?'Due today':`Due in ${t.days} day(s)`}</span><span>${['','Low','Medium','High'][t.confidence]} confidence</span></div><div class="actions"><button data-action="edit" data-id="${t.id}" aria-label="Edit ${esc(t.title)}">Edit</button><button data-action="pin" data-id="${t.id}" aria-pressed="${!!t.pinned}" ${t.done||t.excluded?'disabled':''}>${t.pinned?'★ First priority':'☆ Do first'}</button><button data-action="exclude" data-id="${t.id}" aria-pressed="${!!t.excluded}">${t.excluded?'Include':'Leave out'}</button><button data-action="done" data-id="${t.id}" aria-pressed="${!!t.done}">${t.done?'Reopen':'Mark complete'}</button><button data-action="remove" data-id="${t.id}" aria-label="Remove ${esc(t.title)}">Remove</button></div></article>`).join('')||'<p>No tasks yet. Add a task to begin.</p>';
 let number=0;
 $('#plan').innerHTML=`<div class="metrics"><div><strong>${result.study} min</strong><span>PLANNED STUDY</span></div><div><strong>${result.breaks} min</strong><span>BREAKS</span></div><div><strong>${result.unused} min</strong><span>UNALLOCATED</span></div></div>${result.remaining?`<div class="notice"><strong>${result.remaining} minutes of estimated work remain.</strong><br>This is a starting session, not a promise to finish everything.</div>`:''}${result.blocks.map(b=>b.kind==='break'?'<div class="break">5 min · Step away and reset</div>':`<div class="block"><span class="number">${++number}</span><div class="block-content"><div class="block-title">${esc(b.title)}<span>${b.minutes} min</span></div><p>${b.pinned?'First because you chose it. ':''}${b.minutes<b.estimate?`${b.minutes} of ${b.estimate} estimated minutes.`:'Your full estimate fits.'}</p><details><summary>Why this suggestion?</summary><p>Urgency ${b.urgency} × ${state.mode==='deadlines'?3:1} + support ${b.support} = ${b.score}. ${b.pinned?'Your override takes precedence.':'Higher scores come first unless overridden.'} Due in ${b.days} day(s); ${['','low','medium','high'][b.confidence]} confidence. One block per task; ${state.cap}-minute maximum.</p></details></div></div>`).join('')||'<p>No unfinished tasks are included. Add or include a task to get a plan.</p>'}<div class="remaining"><strong>After this session</strong>${result.ranked.map(t=>{const b=result.blocks.find(b=>b.kind==='task'&&b.id===t.id);const left=t.minutes-(b?.minutes||0);return left?`<p>${esc(t.title)} · ${left} min remaining${b?'':' · not scheduled'}</p>`:'';}).join('')||'<p>No estimated work remains in the included tasks.</p>'}</div>`;
 if(!active()){$('#session-task').innerHTML=result.blocks.filter(b=>b.kind==='task').map(b=>`<option value="${b.id}">${esc(b.title)} · ${b.minutes} min</option>`).join('');if(result.blocks.some(b=>b.kind==='task'&&String(b.id)===selectedTask))$('#session-task').value=selectedTask;}
 updateControls();renderObservation();renderSavedStatus();
 if(taskFocus){
   // Keep the same action; when removed, use the next task, then the previous.
   let target=document.querySelector(`#tasks [data-id="${focusId}"][data-action="${focusAction}"]`);
   if(!target||target.disabled){
     target=document.querySelector(`#tasks [data-id="${focusId}"][data-action="edit"]`);
   }
   if(!target){const edits=[...document.querySelectorAll('#tasks [data-action="edit"]')];target=edits[Math.min(Math.max(oldIndex,0),edits.length-1)]||$('#add');}
   target.focus();
 }
}
function updateControls(){$('#review-block').hidden=!reviewTarget;const busy=active();$('#restore-plan').disabled=!!busy||!savedSnapshot;$('#start').disabled=!!busy||!result.blocks.some(b=>b.kind==='task');$('#pause').disabled=!busy;$('#finish').disabled=!busy;$('#observe').disabled=!!busy;$('#session-task').disabled=!!busy;$('#pause').textContent=clock?.status==='paused'?'Resume':'Pause';$('#sim-example').disabled=!!busy;}
function openTask(t){editing=t?.id??null;$('#task-form').reset();$('#form-error').textContent='';$('#task-heading').textContent=t?'Edit task':'Add a task';if(t)for(const key of ['title','minutes','days','confidence'])$('#task-form').elements[key].value=t[key];$('#task-dialog').showModal();$('#task-form').elements.title.focus();}
$('#add').onclick=()=>openTask();$('#cancel-task').onclick=()=>$('#task-dialog').close();
$('#task-form').onsubmit=e=>{e.preventDefault();const form=new FormData(e.target);const title=String(form.get('title')).trim();if(!title){$('#form-error').textContent='Enter a task name.';return;}checkpoint();const item={id:editing??Math.max(0,...state.tasks.map(t=>t.id))+1,title,minutes:Number(form.get('minutes')),days:Number(form.get('days')),confidence:Number(form.get('confidence'))};if(editing!==null)Object.assign(state.tasks.find(t=>t.id===editing),item);else state.tasks.push(item);render();$('#task-dialog').close();document.querySelector(`#tasks [data-id="${item.id}"][data-action="edit"]`)?.focus();say('Task saved. Your plan has updated.');};
$('#tasks').onclick=e=>{const b=e.target.closest('[data-action]');if(!b)return;const t=state.tasks.find(t=>t.id===Number(b.dataset.id));const action=b.dataset.action;if(action==='edit'){openTask(t);return;}checkpoint();if(action==='pin'){const pinned=!t.pinned;state.tasks.forEach(t=>t.pinned=false);t.pinned=pinned;}if(action==='exclude')t.excluded=!t.excluded;if(action==='done')t.done=!t.done;if(action==='remove'){state.tasks=state.tasks.filter(x=>x.id!==t.id);if(reviewTarget===t)reviewTarget=null;}render();say(`${t.title}: ${action==='pin'?'priority updated':action==='exclude'?'inclusion updated':action==='done'?'completion updated':'removed'}. Undo is available.`);};
for(const key of ['budget','mode','cap'])$('#'+key).onchange=e=>{if(!e.target.checkValidity()){e.target.reportValidity();e.target.value=state[key];say('That value was not applied. Choose a whole number between 5 and 240.');return;}checkpoint();state[key]=key==='mode'?e.target.value:Number(e.target.value);render();say('Plan updated. An active timer keeps its original task and duration.');};
$('#undo').onclick=()=>{if(!previous)return;state=previous.state;decision=previous.decision;reviewTarget=null;previous=null;$('#undo').disabled=true;render();say('Previous plan restored. Live measurements are not rewound.');};
for(const b of document.querySelectorAll('[data-demo]'))b.onclick=()=>{reviewTarget=null;checkpoint();state=defaults();if(b.dataset.demo==='overload')state.budget=20;render();say('Example tasks replaced the task list. Undo restores your previous plan.');};
$('#how').onclick=()=>$('#how-dialog').showModal();$('#close-how').onclick=()=>$('#how-dialog').close();
function tick(){if(!clock)return;advance(clock,performance.now());$('#timer').textContent=format(clock.elapsedMs);if(clock.status==='running'&&clock.elapsedMs>=activeTask.minutes*60000){finishBlock(true);}}
function finishBlock(automatic=false){if(!active())return;advance(clock,performance.now());clock.status='finished';observation={source:'Live observation',task:activeTask.title,elapsedMs:clock.elapsedMs,hiddenMs:clock.hiddenMs,switches:clock.switches,pauses:clock.pauses,observing:clock.observing,at:new Date().toISOString()};reviewTarget=state.tasks.includes(activeTask.sourceTask)?activeTask.sourceTask:null;decision=null;previous=null;$('#undo').disabled=true;$('#timer-state').textContent=automatic?'Block duration reached. Review the observations below.':'Block ended. Review the observations below.';render();say('Block ended. Your tasks and estimates have not been marked complete.');}
$('#start').onclick=()=>{const b=result.blocks.find(b=>b.kind==='task'&&b.id===Number($('#session-task').value));if(!b)return;activeTask={...structuredClone(b),sourceTask:state.tasks.find(t=>t.id===b.id)};reviewTarget=null;clock=createClock(performance.now(),$('#observe').checked);clock.hidden=document.hidden;observation=null;decision=null;previous=null;$('#undo').disabled=true;$('#timer').textContent='00:00';$('#timer-state').textContent=`Running: ${b.title} · ${b.minutes}-minute block · Observation ${clock.observing?'on':'off'}.`;updateControls();renderObservation();renderSavedStatus();say('Block started. You can pause or finish at any time.');};
$('#pause').onclick=()=>{if(!active())return;if(clock.status==='running'){pause(clock,performance.now());$('#timer-state').textContent='Paused. Time and page departures are not counted.';}else{resume(clock,performance.now());clock.hidden=document.hidden;$('#timer-state').textContent=`Running: ${activeTask.title} · Observation ${clock.observing?'on':'off'}.`;}updateControls();say(clock.status==='paused'?'Timer paused.':'Timer resumed.');};
$('#finish').onclick=()=>finishBlock();document.addEventListener('visibilitychange',()=>{if(clock)visibility(clock,document.hidden,performance.now());});setInterval(tick,500);
$('#sim-example').onclick=()=>{if(active())return;reviewTarget=null;$('#review-block').hidden=true;clock=null;observation={source:'SIMULATED EXAMPLE',task:'Example study block',elapsedMs:600000,hiddenMs:120000,switches:3,pauses:1,observing:true,at:new Date().toISOString()};decision=null;previous=null;$('#undo').disabled=true;$('#timer').textContent='10:00';$('#timer-state').textContent='Simulated observation loaded. No live tracking is running.';renderObservation();say('Simulated example loaded: 10 minutes, 3 departures, 2 minutes hidden. Your tasks are unchanged.');$('#session-heading').scrollIntoView({behavior:'auto',block:'start'});};
function renderObservation(){if(!observation){$('#observations').innerHTML=active()?`<p>Block in progress · observation ${clock.observing?'on':'off'}.</p><p class="small">Review appears after the block to avoid interrupting your work.</p>`:'<p>No observations stored.</p><p class="small">Session observations stay in this tab only. Reload clears this session; explicitly saved plans can be restored.</p>';$('#suggestion').innerHTML='';return;}
 const o=observation;$('#observations').innerHTML=`<p class="source">${esc(o.source)}</p><p>${esc(o.task)}</p><dl><dt>Elapsed block time</dt><dd>${format(o.elapsedMs)}</dd><dt>Page departures</dt><dd>${o.observing?o.switches:'Not observed'}</dd><dt>Time page hidden</dt><dd>${o.observing?format(o.hiddenMs):'Not observed'}</dd><dt>Manual pauses</dt><dd>${o.pauses}</dd></dl><p class="small">${esc(new Date(o.at).toLocaleString())} · Elapsed time is not measured concentration.</p>`;
 const inference=infer(o);$('#suggestion').innerHTML=`<div class="suggestion">${decision?`<strong>${esc(decision)}</strong><p>Current maximum: ${state.cap} minutes per block.</p>`:!o.observing?'<p>Observation was off. No behavioural adaptation proposed.</p>':!inference.suggest?`<p>${inference.reason}</p>`:`<strong>Would a shorter block suit you?</strong><p>${inference.reason} You may also have been reading elsewhere; we cannot tell.</p><p class="small">Rule: ${inference.threshold}</p>${state.cap===15?'<p>Your maximum is already 15 minutes. No change needed.</p>':'<div class="actions"><button id="accept" class="primary">Try 15-minute blocks</button><button id="reject">Keep my setting</button></div>'}`}</div>`;
 if($('#accept'))$('#accept').onclick=()=>{checkpoint();state.cap=15;decision='You accepted the suggestion to use 15-minute blocks.';render();say('Maximum changed to 15 minutes by you. Undo restores the previous setting.');};if($('#reject'))$('#reject').onclick=()=>{checkpoint();decision='You rejected the suggestion; it did not change your setting.';renderObservation();say('Suggestion rejected. No plan setting changed.');};
}
$('#clear').onclick=()=>{reviewTarget=null;clock=null;observation=null;decision=null;activeTask=null;previous=null;$('#undo').disabled=true;$('#timer').textContent='00:00';$('#timer-state').textContent='Stopped. All observations and decisions forgotten.';render();say('Observations, decision and undo history cleared. Your task list and chosen block maximum remain.');};
$('#export').onclick=()=>{const snapshot={prototype:'Studyloom v0.1',exportedAt:new Date().toISOString(),inputs:state,plan:result,latestObservation:observation,decision,timerInProgress:!!active(),note:'Estimates and adaptation thresholds are unvalidated assumptions. Simulated observations are labelled by source.'};const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='studyloom-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Export download requested. Check your browser downloads.');};
readSavedPlan();
render();

function invalidateReview(){reviewDraft=null;$('#review-preview').textContent='';$('#apply-review').hidden=true;$('#review-error').textContent='';}
$('#review-block').onclick=()=>{
 if(!reviewTarget||!state.tasks.includes(reviewTarget)){reviewTarget=null;updateControls();say('That task changed or was removed. Use Edit to update it.');return;}
 reviewBase=JSON.stringify(state);invalidateReview();$('#review-task').textContent=`${reviewTarget.title} · Current estimate: ${reviewTarget.minutes} minutes`;
 $('#review-outcome').value=reviewTarget.done?'finished':'progress';$('#review-remaining').value=reviewTarget.minutes;
 $('#review-remaining').disabled=reviewTarget.done;$('#remaining-label').hidden=reviewTarget.done;
 $('#review-dialog').showModal();$('#review-outcome').focus();
};
$('#review-outcome').onchange=()=>{invalidateReview();const finished=$('#review-outcome').value==='finished';$('#review-remaining').disabled=finished;$('#remaining-label').hidden=finished;};
$('#review-remaining').oninput=invalidateReview;
$('#review-form').onsubmit=e=>{
 e.preventDefault();invalidateReview();
 try {
  if(JSON.stringify(state)!==reviewBase)throw Error('Your plan changed. Close and reopen this review.');
  reviewDraft=reviewTask(state,reviewTarget.id,$('#review-outcome').value,Number($('#review-remaining').value));
  const p=reviewDraft.plan;const task=reviewDraft.state.tasks.find(t=>t.id===reviewTarget.id);
  $('#review-preview').innerHTML=`<div class="notice"><strong>Preview only — no changes applied</strong><p>${esc(task.title)}: ${task.done?'will be marked complete':`${task.minutes} minutes still remaining`}.</p><p>Next plan: ${p.study} study minutes, ${p.breaks} break minutes, ${p.unused} unused minutes.</p><p>Uses your current ${state.budget}-minute budget. Adjust available time in the planner if needed.</p><ul>${p.blocks.map(b=>`<li>${b.kind==='break'?'Break':esc(b.title)} · ${b.minutes} min</li>`).join('')||'<li>No included unfinished tasks.</li>'}</ul></div>`;
  $('#apply-review').hidden=false;
 }catch(error){$('#review-error').textContent=error.message;}
};
$('#apply-review').onclick=()=>{
 if(!reviewDraft)return;
 if(JSON.stringify(state)!==reviewBase){invalidateReview();$('#review-error').textContent='Your plan changed. Close and reopen this review.';return;}
 checkpoint();state=reviewDraft.state;reviewTarget=null;reviewDraft=null;render();$('#review-dialog').close();$('#undo').focus();say('Your progress update was applied. Undo restores the previous estimate and completion state.');
};
$('#cancel-review').onclick=()=>{$('#review-dialog').close();invalidateReview();};
$('#review-dialog').addEventListener('cancel',invalidateReview);

function readSavedPlan(){
 savedSnapshot=null;savedRawExists=false;storageError='';
 try{const raw=document.defaultView.localStorage.getItem(STORAGE_KEY);savedRawExists=raw!==null;if(raw!==null)savedSnapshot=decodePlan(raw);}
 catch{storageError=savedRawExists?'The saved copy is unreadable. Your current plan is unchanged. Delete it or save a replacement.':'Browser storage is unavailable. You can still use and export your plan.';}
}
function renderSavedStatus(){
 $('#delete-plan').disabled=!savedRawExists;
 $('#restore-plan').disabled=!!active()||!savedSnapshot;
 if(storageError){$('#save-status').textContent=storageError;return;}
 if(!savedSnapshot){$('#save-status').textContent='Not saved on this browser.';return;}
 let matches=false;try{matches=JSON.stringify(cleanPlan(state))===JSON.stringify(savedSnapshot.plan);}catch{}
 $('#save-status').textContent=`Saved ${new Date(savedSnapshot.savedAt).toLocaleString()}. ${matches?'Current plan matches the saved copy.':'Current plan differs from the saved copy. Save again to keep these changes.'}${active()?' Finish or stop the block before restoring.':''}`;
}
$('#save-plan').onclick=()=>{
 try{const raw=encodePlan(state);document.defaultView.localStorage.setItem(STORAGE_KEY,raw);readSavedPlan();renderSavedStatus();say('Tasks and planning settings saved on this browser. Observations were not saved.');}
 catch{storageError='Saving failed. The current plan is still available; export it if you need a copy.';renderSavedStatus();}
};
$('#restore-plan').onclick=()=>{
 if(active())return;
 // Re-read in case another tab replaced or deleted the copy.
 readSavedPlan();if(!savedSnapshot){renderSavedStatus();return;}
 checkpoint();state=structuredClone(savedSnapshot.plan);reviewTarget=null;render();say('Saved plan restored. Check due-in-days values if saved on another day. Undo restores your previous plan.');
};
$('#delete-plan').onclick=()=>{
 try{document.defaultView.localStorage.removeItem(STORAGE_KEY);readSavedPlan();renderSavedStatus();say('Saved copy deleted from this browser. Current tasks remain; nothing will be saved again unless you choose Save.');}
 catch{storageError='Could not delete the saved copy. Browser storage may be blocked.';renderSavedStatus();}
};
document.defaultView.addEventListener('storage',event=>{if(event.key===STORAGE_KEY||event.key===null){readSavedPlan();renderSavedStatus();}});

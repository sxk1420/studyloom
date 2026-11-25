// Design heuristics, not validated measures of ability, attention or learning.
export const defaults = () => ({
  budget: 60,
  cap: 25,
  mode: 'balanced',
  tasks: [
    {id: 1, title: 'Revise recursion', minutes: 30, days: 1, confidence: 1},
    {id: 2, title: 'Draft interaction design report', minutes: 45, days: 3, confidence: 2},
    {id: 3, title: 'Review database notes', minutes: 20, days: 7, confidence: 3},
  ],
});

export function validate(state) {
  if (!Number.isInteger(state.budget) || state.budget < 5 || state.budget > 240) {
    throw Error('Available time must be a whole number from 5 to 240.');
  }
  if (!Number.isInteger(state.cap) || state.cap < 5 || state.cap > 240) {
    throw Error('Maximum block must be a whole number from 5 to 240.');
  }
  if (!['balanced', 'deadlines'].includes(state.mode)) {
    throw Error('Invalid planning setting.');
  }
  const ids = new Set();
  for (const task of state.tasks) {
    if (
      !Number.isInteger(task.id) || ids.has(task.id) ||
      typeof task.title !== 'string' || !task.title.trim() || task.title.length > 100 ||
      !Number.isInteger(task.minutes) || task.minutes < 5 || task.minutes > 240 ||
      !Number.isInteger(task.days) || task.days < -30 || task.days > 365 ||
      ![1, 2, 3].includes(task.confidence)
    ) {
      throw Error('Check task name, duration (5–240), due days (−30–365) and confidence.');
    }
    ids.add(task.id);
  }
}

export function plan(state) {
  validate(state);
  const weight = state.mode === 'deadlines' ? 3 : 1;
  const ranked = state.tasks
    .filter(task => !task.excluded && !task.done)
    .map(task => {
      const urgency = task.days <= 0 ? 6 : task.days === 1 ? 5 : task.days <= 3 ? 3 : 1;
      const support = 4 - task.confidence;
      return {...task, urgency, support, score: weight * urgency + support};
    })
    .sort((a, b) =>
      Number(!!b.pinned) - Number(!!a.pinned) ||
      b.score - a.score || a.days - b.days || a.id - b.id
    );

  let left = state.budget;
  const blocks = [];
  for (const task of ranked) {
    if (left < 5) break;
    if (blocks.length) {
      // Add a break only when at least five study minutes can follow it.
      if (left < 10) break;
      blocks.push({kind: 'break', minutes: 5});
      left -= 5;
    }
    const minutes = Math.min(left, state.cap, task.minutes);
    blocks.push({...task, kind: 'task', estimate: task.minutes, minutes});
    left -= minutes;
  }
  const study = blocks.filter(block => block.kind === 'task')
    .reduce((sum, block) => sum + block.minutes, 0);
  const total = ranked.reduce((sum, task) => sum + task.minutes, 0);
  return {
    ranked, blocks, study,
    breaks: state.budget - left - study,
    unused: left,
    remaining: total - study,
  };
}

export function infer(observation) {
  // The minimum duration limits immediate prompting; it is not calibrated evidence.
  const enough = observation.elapsedMs >= 300000;
  const interrupted = observation.switches >= 3 || observation.hiddenMs >= 120000;
  return {
    suggest: enough && interrupted,
    reason: !enough
      ? 'There is less than five minutes of observation. No adaptation proposed.'
      : !interrupted
        ? 'The observation threshold was not reached. No adaptation proposed.'
        : 'Frequent page changes or time away may mean a shorter block would suit this session.',
    threshold: 'At least 5 elapsed minutes, plus 3 page departures or 2 minutes hidden.',
  };
}

export function createClock(now, observing = false) {
  return {
    status: 'running', observing, last: now,
    elapsedMs: 0, hiddenMs: 0, switches: 0, pauses: 0, hidden: false,
  };
}

export function advance(clock, now) {
  const elapsed = Math.max(0, now - clock.last);
  if (clock.status === 'running') {
    clock.elapsedMs += elapsed;
    if (clock.observing && clock.hidden) clock.hiddenMs += elapsed;
  }
  clock.last = now;
}

export function visibility(clock, hidden, now) {
  advance(clock, now);
  if (clock.observing && clock.status === 'running' && hidden && !clock.hidden) {
    clock.switches++;
  }
  clock.hidden = hidden;
}

export function pause(clock, now) {
  advance(clock, now);
  if (clock.status === 'running') {
    clock.status = 'paused';
    clock.pauses++;
  }
}

export function resume(clock, now) {
  clock.last = now;
  clock.status = 'running';
}

// Reviews are explicit user estimates. Timer duration never implies progress.
export function reviewTask(state, taskId, outcome, remaining) {
  validate(state);
  const next = structuredClone(state);
  const task = next.tasks.find(task => task.id === taskId);
  if (!task) throw Error('This task no longer exists. Review your task list instead.');
  if (!['finished', 'progress', 'more-time'].includes(outcome)) {
    throw Error('Choose a review outcome.');
  }
  if (outcome === 'finished') {
    task.done = true;
  } else {
    if (!Number.isInteger(remaining) || remaining < 5 || remaining > 240) {
      throw Error('Remaining work must be 5–240 whole minutes, or choose Finished.');
    }
    task.minutes = remaining;
    task.done = false;
  }
  return {state: next, plan: plan(next)};
}

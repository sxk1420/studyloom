import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults} from '../src/engine.mjs';
import {cleanPlan} from '../src/storage.mjs';
import {parsePlanImport} from '../src/import.mjs';

test('imports a Studyloom export without modifying its original inputs', () => {
  const inputs = defaults();
  const before = structuredClone(inputs);

  const imported = parsePlanImport(JSON.stringify({
    prototype: 'Studyloom v0.1',
    inputs
  }));

  assert.deepEqual(imported, cleanPlan(inputs));
  assert.deepEqual(inputs, before);
});

test('ignores exported observations, decisions and calculated plans', () => {
  const imported = parsePlanImport(JSON.stringify({
    prototype: 'Studyloom v0.1',
    inputs: defaults(),
    latestObservation: {hiddenMs: 120000},
    decision: 'accepted',
    plan: {study: 999999}
  }));

  assert.deepEqual(
    Object.keys(imported),
    ['budget', 'cap', 'mode', 'tasks']
  );

  assert.equal(imported.latestObservation, undefined);
  assert.equal(imported.decision, undefined);
});

test('rejects malformed, unrelated, oversized and invalid exports', () => {
  assert.throws(() => parsePlanImport('not JSON'));

  assert.throws(() => parsePlanImport(JSON.stringify({
    inputs: defaults()
  })));

  assert.throws(() => parsePlanImport(' '.repeat(250001)));

  const invalid = defaults();
  invalid.tasks[0].minutes = -5;

  assert.throws(() => parsePlanImport(JSON.stringify({
    prototype: 'Studyloom v0.1',
    inputs: invalid
  })));
});
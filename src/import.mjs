import {cleanPlan} from './storage.mjs';

export function parsePlanImport(raw) {
  if (typeof raw !== 'string' || raw.length > 250000) {
    throw new Error('Choose a JSON export smaller than 250 KB.');
  }

  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('This file does not contain valid JSON.');
  }

  if (
    !data ||
    data.prototype !== 'Studyloom v0.1' ||
    !data.inputs
  ) {
    throw new Error('Choose a file created by Studyloom’s Export button.');
  }

  // Import only validated tasks and planning settings.
  // Ignore exported observations, decisions and calculated recommendations.
  return cleanPlan(data.inputs);
}
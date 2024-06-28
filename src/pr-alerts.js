import { refAlerts } from './ref-alerts.js';
import { commentAlerts } from './comment-alerts.js';

async function getAlerts(owner, repos, totalDays, includeRefAlerts, octokit) {
  let alerts = [];

  try {
    if (includeRefAlerts === true) {
      console.log('Include Ref Alerts');
      alerts = await refAlerts.getAlerts(owner, repos, totalDays, octokit);
    } else {
      // Note: I opted to get alerts for comments individually, rather than filtering the alerts
      // in the ref to only those that are also in the comments, because codebases can have hundreds
      // (or even thousands) of existing alerts that will appear on the merge or head ref, while only
      // a couple alerts may actually be surfaced on the PRs at any given time, so, in many cases,
      // this approach will require fewer requests to the API than the alternative approach.
      console.log('Comment Alerts Only');
      alerts = await commentAlerts.getAlerts(owner, repos, totalDays, octokit);
    }
  } catch (error) {
    throw error;
  }

  return alerts;
}

export const prAlerts = {
  getAlerts: getAlerts
}

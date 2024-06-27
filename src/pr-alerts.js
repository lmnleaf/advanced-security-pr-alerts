import { refAlerts } from './ref-alerts.js';
import { commentAlerts } from './comment-alerts.js';

async function getAlerts(owner, repos, totalDays, commentAlertsOnly, octokit) {
  let alerts = [];

  try {
    if (commentAlertsOnly === true) {
      // Note: I opted for getting alerts for comments exclusively, rather than filtering the alerts
      // from the ref to only those that are also in comments, because codebases can have hundreds (or
      // even thousands) of existing alerts that will appear on the merge or head ref, while only a
      // couple alerts are actually surfaced on any of the PRs at any given time, so, in many cases,
      // this approach will actually require fewer requests to the API that the alternative approach.
      console.log('Comment Alerts Only');
      alerts = await commentAlerts.getAlerts(owner, repos, totalDays, octokit);
    } else {
      console.log('Ref Alerts');
      alerts = await refAlerts.getAlerts(owner, repos, totalDays, octokit);
    }
  } catch (error) {
    throw error;
  }

  return alerts;
}

export const prAlerts = {
  getAlerts: getAlerts
}

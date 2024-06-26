import { refAlerts } from './ref-alerts.js';
// import { commentAlerts } from './comment-alerts.js';

async function getAlerts(owner, repos, totalDays, commentAlertsOnly, octokit) {
  let alerts = [];

  try {
    if (commentAlertsOnly) {
      console.log('Comment Alerts Only');
      // alerts = await commentAlerts.getAlerts(owner, reposList, totalDays, octokit);
    } else {
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

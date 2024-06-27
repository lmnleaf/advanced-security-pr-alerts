import { prList } from './pr-list.js';
import { commentAlertNumbers } from './comment-alert-numbers.js'; 

async function getAlerts(owner, repos, totalDays, octokit) {
  let prs = await prList.getPRs(owner, repos, totalDays, octokit);

  let alerts = [];

  for (const pr of prs) {
    const alertNumbers = await commentAlertNumbers.getNumbers(owner, pr, octokit);

    let prAlerts = [];

    for (const alertNumber of alertNumbers) {
      try {
        const prAlert = await octokit.rest.codeScanning.getAlert({
          owner,
          repo: pr.repo,
          alert_number: alertNumber
        });
        prAlerts.push(prAlert.data);
      } catch (error) {
        throw error;
      }
    }

    prAlerts = prAlerts.map((alert) => {
      let newAlert = {...alert,
        pr: {
          repo: pr.repo,
          number: pr.number,
          user: pr.user,
          state: pr.state,
          draft: pr.draft,
          mergedAt: pr.merged_at,
          updatedAt: pr.updated_at
        },
        inPRComment: true
      };

      return newAlert;
    })

    alerts = alerts.concat(prAlerts);
  }

  return alerts;
}

export const commentAlerts = {
  getAlerts: getAlerts
}

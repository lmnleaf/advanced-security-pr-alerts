import { prList } from './pr-list.js';
import { commentAlertNumbers } from './comment-alert-numbers.js';

async function getAlerts(owner, repos, totalDays, octokit) {
  let prs = await prList.getPRs(owner, repos, totalDays, octokit);

  let alerts = [];

  for (const pr of prs) {
    let prAlerts = [];

    try {
      const mergeAlerts = await octokit.paginate(
        octokit.rest.codeScanning.listAlertsForRepo,
        {
          owner,
          repo: pr.repo,
          ref: 'refs/pull/' + pr.number + '/merge',
          per_page: 100,
        },
        (response, done) => {
          prAlerts.push(...response.data);
        }
      );

      const headAlerts = await octokit.paginate(
        octokit.rest.codeScanning.listAlertsForRepo,
        {
          owner,
          repo: pr.repo,
          ref: 'refs/pull/' + pr.number + '/head',
          per_page: 100,
        },
        (response, done) => {
          prAlerts.push(...response.data);
        }
      );

      await Promise.all([mergeAlerts, headAlerts]);
    } catch (error) {
      if (error.message.includes('no analysis found')) {
        continue;
      } else {
        throw error;
      }
    }

    let inCommentNumbers = [];
    if (prAlerts.length !== 0) {
      let inCommentAlerts = await commentAlertNumbers.getNumbers(owner, [pr], octokit);
      inCommentNumbers = inCommentAlerts.map((alert) => alert.alertNumber);
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
        inPRComment: (inCommentNumbers.includes(alert.number) ? true : false)
      };

      return newAlert;
    })

    alerts = alerts.concat(prAlerts);
  }

  return alerts;
}

export const refAlerts = {
  getAlerts: getAlerts
}

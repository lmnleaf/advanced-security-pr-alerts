import { repoPRs } from './repo-prs.js';
import { orgRepos } from './org-repos.js';
import { commentAlertNumbers } from './comment-alert-numbers.js';

async function getAlerts(owner, repos, totalDays, octokit) {
  let reposList = [];

  if (repos.length === 1 && repos[0] === 'all') {
    reposList = await orgRepos.getOrgRepos(owner, octokit);
  } else {
    reposList = repos;
  }

  let prs = [];

  for (const repo of reposList) {
    let prList = await repoPRs.getPRs(owner, repo, totalDays, octokit);
    prs = prs.concat(prList);
  }

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

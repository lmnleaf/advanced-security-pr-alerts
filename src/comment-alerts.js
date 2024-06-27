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
  let alerts = [];

  for (const repo of reposList) {
    let prList = await repoPRs.getPRs(owner, repo, totalDays, octokit);
    prs = prs.concat(prList);
  }

  for (const pr of prs) {
    const alertNumbers = await commentAlertNumbers.getNumbers(owner, [pr], octokit);

    let prAlerts = [];

    for (const alertNumber of alertNumbers) {
      try {
        const prAlert = await octokit.rest.codeScanning.getAlert({
          owner,
          repo: pr.repo,
          alert_number: alertNumber.alertNumber
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

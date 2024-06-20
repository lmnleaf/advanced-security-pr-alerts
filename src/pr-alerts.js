import { repoPRs } from './repo-prs.js';
import { orgRepos } from './org-repos.js';

async function getAlerts(owner, repos, octokit) {
  let reposList = [];

  if (repos.length === 0) {
    reposList = await orgRepos.getOrgRepos(owner, octokit);
  } else {
    reposList = repos;
  }

  let prs = [];

  for (const repo of reposList) {
    let prList = await repoPRs.getPRs(owner, repo, octokit);
    prs = prs.concat(prList);
  }

  let alerts = [];

  for (const pr of prs) {
    let prAlerts = [];

    try {
      await octokit.paginate(
        octokit.rest.codeScanning.listAlertsForRepo,
        {
          owner,
          repo: pr.repo,
          ref: `refs/pull/${pr.number}/head`,
          // per_page should eventually be 100
          per_page: 5,
        },
        (response, done) => {
          prAlerts.push(...response.data);
        }
      );
    } catch (error) {
      throw error;
    }

    prAlerts = prAlerts.map((alert) => {
      let newAlert = {...alert, pr: {
        repo: pr.repo,
        number: pr.number,
        user: pr.user,
        state: pr.state,
        draft: pr.draft,
        merged_at: pr.merged_at,
        updated_at: pr.updated_at
      }};

      return newAlert;
    })

    alerts = alerts.concat(prAlerts);
  }

  return alerts;
}

export default getAlerts;

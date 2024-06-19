import { repoPRs } from './repo-prs.js';

async function getAlerts(owner, repo, octokit) {
  let prs = await repoPRs.getPRs(owner, repo, octokit);

  let alerts = [];

  for (const pr of prs) {
    let prAlerts = [];

    try {
      await octokit.paginate(
        octokit.rest.codeScanning.listAlertsForRepo,
        {
          owner,
          repo,
          ref: `refs/pull/${pr.number}/head`,
          // per_page should eventually be 100
          per_page: 5,
        },
        (response, done) => {
          prAlerts.push(...response.data);
        }
    )} catch (error) {
      throw error;
    }

    let prAlertsWithAlertInfo = prAlerts.map((alert) => {
      alert.pr = {
        repo: pr.repo,
        number: pr.number,
        user: pr.user.login,
        state: pr.state,
        merged_at: pr.merged_at,
        updated_at: pr.updated_at
      };

      return alert;
    })

    alerts = alerts.concat(prAlertsWithAlertInfo);
  }

  return alerts;
}

export default getAlerts;
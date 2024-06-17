const prComments = require('./pr-comments.js');

async function getAlerts(owner, repo, octokit) {
  let alertNumbers = [];
  let alerts = [];
  const comments = await prComments.getComments(owner, repo, octokit);

  // have to get each individual alert because the 
  // alerts on the PR are not returned in the code scanning API 
  // unless the branch itself was scanned

  comments.forEach((comment) => {
    const alertNumber = extractAlertNumber(comment.body);
    if (alertNumber) {
      alertNumbers.push(alertNumber);
    }
  })

  for (const alertNumber of alertNumbers) {
    try {
      const alert = await octokit.rest.codeScanning.getAlert({
        owner,
        repo,
        alert_number: alertNumber
      });

      alerts.push(alert.data);
    } catch (error) {
      throw error;
    }
  }

  return alerts;
}

function extractAlertNumber(str) {
  const regex = /\[Show more details\]\(https:\/\/.*?\/(\d+)\)/;
  const matches = str.match(regex);
  return matches ? matches[1] : null;
}

module.exports = getAlerts
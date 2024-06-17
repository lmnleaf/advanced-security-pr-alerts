const getAlerts = require('./pr-alerts.js');
const fs = require('fs');

async function createReport(owner, repo, octokit) {
  let alertNumbers = [];

  try {
    const alerts = await getAlerts(owner, repo, octokit);

    alertNumbers = alerts.map((alert) => alert.number);
  
    const csvRows = alerts.map((alert) => [
      alert.number,
      alert.rule.id,
      alert.rule.security_severity_level,
      alert.rule.severity,
      alert.rule.description,
      alert.state,
      alert.most_recent_instance.state,
      alert.most_recent_instance.ref,
      alert.most_recent_instance.commit_sha,
      alert.most_recent_instance.location.path,
      alert.tool.name,
      alert.tool.version,
      alert.fixed_at,
      alert.dismissed_at,
      alert.dismissed_by,
      alert.dismissed_reason,
      alert.dismissed_comment,
      alert.created_at,
      alert.updated_at,
      alert.pr.repo,
      alert.pr.number,
      alert.pr.user,
      alert.pr.state,
      alert.pr.draft,
      alert.pr.merged_at,
      alert.pr.updated_at
    ]);
  
    csvRows.unshift([
      'number',
      'rule_id',
      'rule_security_severity_level',
      'rule_severity',
      'description',
      'state',
      'most_recent_instance_state',
      'most_recent_instance_ref',
      'most_recent_commit_sha',
      'most_recent_instance_path',
      'tool',
      'tool_version',
      'fixed_at',
      'dismissed_at',
      'dismissed_by',
      'dismissed_reason',
      'dismissed_comment',
      'created_at',
      'updated_at',
      'repo',
      'pr_number',
      'pr_user',
      'pr_state',
      'pr_draft',
      'pr_merged_at',
      'pr_updated_at'
    ]);
  
    writeReport(csvRows);
  } catch (error) {
    throw error;
  }
  
  return alertNumbers;
}

function writeReport (csvRows) {
  let csvDate = new Date().toISOString().slice(0, 10);

  fs.writeFile('temp/repo-pr-alerts-report-' + csvDate + '.csv', csvRows.join("\r\n"), (error) => {
    console.log(error || "report created successfully");
  });
}

module.exports = createReport
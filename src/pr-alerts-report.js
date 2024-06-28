import { prAlerts } from './pr-alerts.js';
import * as fs from 'fs';

async function createReport(owner, repos, totalDays, includeRefAlerts, path, octokit) {
  let alerts = [];

  try {
    alerts = await prAlerts.getAlerts(owner, repos, totalDays, includeRefAlerts, octokit);

    if (alerts.length === 0) {
      return 'No PR alerts found.';
    }

    writeReport(alerts, path);
  } catch (error) {
    throw error;
  }
 
  return reportSummary(repos, alerts);
}

function writeReport (alerts, path) {
  const csvRows = alerts.map((alert) => [
    alert.number,
    alert.rule.id,
    alert.rule.security_severity_level,
    alert.rule.severity,
    alert.rule.description,
    alert.state,
    alert.pr.repo,
    alert.inPRComment,
    alert.pr.number,
    alert.pr.user,
    alert.pr.state,
    alert.pr.draft,
    alert.pr.mergedAt,
    alert.pr.updatedAt,
    alert.most_recent_instance.state,
    alert.most_recent_instance.ref,
    alert.most_recent_instance.commit_sha,
    alert.most_recent_instance.location.path,
    (alert.tool != null ? alert.tool.name : null),
    (alert.tool != null ? alert.tool.version : null),
    alert.fixed_at,
    alert.dismissed_at,
    (alert.dismissed_by != null ? alert.dismissed_by.login : null),
    alert.dismissed_reason,
    alert.dismissed_comment,
    alert.created_at,
    alert.updated_at
  ]);

  csvRows.unshift([
    'number',
    'rule_id',
    'rule_security_severity_level',
    'rule_severity',
    'description',
    'state',
    'repo',
    'in_pr_comment',
    'pr_number',
    'pr_user',
    'pr_state',
    'pr_draft',
    'pr_merged_at',
    'pr_updated_at',
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
    'updated_at'
  ]);

  alertsReport.writeFile(path + '/pr-alerts-report.csv', csvRows.join("\r\n"), (error) => {
    console.log(error || "report created successfully");
  });
}

function writeFile (path, data, callback) {
  fs.writeFile(path, data, callback);
}

function reportSummary (repos, alerts) {
  let reportSummary = 'Total PR alerts found: ' + alerts.length.toString() + '. \n' +
    'All org repos reviewed: ' + (repos.length === 1 && repos[0] === 'all' ? 'true' : 'false') + '. \n' +
    'Repos reviewed: ' + (repos.length > 0 ? repos.join(', ') + '.' : 'All Org Repos.');

  return reportSummary;
}

export const alertsReport = {
  writeFile: writeFile,
  createReport: createReport
}

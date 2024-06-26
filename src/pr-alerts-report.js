import { prAlerts } from './pr-alerts.js';
import * as fs from 'fs';

async function createReport(reposInput, totalDaysInput, commentAlertsOnly, path, context, octokit) {
  let alertInfo = [];

  const { owner, repos, totalDays } = processInput(reposInput, totalDaysInput, context);

  try {
    const alerts = await prAlerts.getAlerts(owner, repos, totalDays, commentAlertsOnly, octokit);

    if (alerts.length === 0) {
      return 'No PR alerts found.';
    }

    alertInfo = alerts.map((alert) => {
      let info = {
        repo: alert.pr.repo,
        number: alert.number
      }

      return info;
    });

    writeReport(alerts, path);
  } catch (error) {
    throw error;
  }
 
  return reportSummary(repos, alertInfo);
}

function writeReport (alerts, path) {
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
    (alert.tool != null ? alert.tool.name : null),
    (alert.tool != null ? alert.tool.version : null),
    alert.fixed_at,
    alert.dismissed_at,
    (alert.dismissed_by != null ? alert.dismissed_by.login : null),
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

  alertsReport.writeFile(path + '/pr-alerts-report.csv', csvRows.join("\r\n"), (error) => {
    console.log(error || "report created successfully");
  });
}

function writeFile (path, data, callback) {
  fs.writeFile(path, data, callback);
}

function reportSummary (repos, alertInfo) {
  let reportSummary = 'Total PR alerts found: ' + alertInfo.length.toString() + '. \n' +
    'All org repos reviewed: ' + (repos.length === 0 ? 'true' : 'false') + '. \n' +
    'Repos reviewed: ' + (repos.length > 0 ? repos.join(', ') + '.' : 'All Org Repos.');

  return reportSummary;
}

function processInput (repos, totalDays, context) {
  let input = {
    owner: context.repo.owner,
    repos: [context.repo.repo],
    totalDays: 30
  }

  if (repos != null && repos.length > 0) {
    input.repos = repos.split(',');
  }

  let days = parseInt(totalDays);
  if (days != NaN && days > 0 && days <= 365) {
    input.totalDays = days;
  }

  return input;
}

export const alertsReport = {
  writeFile: writeFile,
  createReport: createReport
}

import * as github from '@actions/github';
import * as core from '@actions/core';
import * as dotenv from 'dotenv';
import { alertsReport } from './src/pr-alerts-report.js';


const context = github.context;

async function main() {
  try {
    const token = core.getInput('TOKEN');
    const octokit = new github.getOctokit(token);
    const totalDaysInput = core.getInput('total_days');
    const reposInput = core.getInput('repos');
    const path = core.getInput('path');
    const includeRefAlertsInput = core.getInput('include_ref_alerts');

    const { owner, repos, totalDays, includeRefAlerts } = processInput(
      reposInput,
      totalDaysInput,
      includeRefAlertsInput,
      context
    );

    const reportSummary = await alertsReport.createReport(owner, repos, totalDays, includeRefAlerts, path, octokit);

    return core.notice(reportSummary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

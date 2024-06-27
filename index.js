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
    const commentAlertsOnlyInput = core.getInput('comment_alerts_only');

    const { owner, repos, totalDays, commentAlertsOnly } = processInput(
      reposInput,
      totalDaysInput,
      commentAlertsOnlyInput,
      context
    );

    const reportSummary = await alertsReport.createReport(owner, repos, totalDays, commentAlertsOnly, path, octokit);

    return core.notice(reportSummary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

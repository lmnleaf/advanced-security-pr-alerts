import * as github from '@actions/github';
import * as core from '@actions/core';
import * as dotenv from 'dotenv';
import { alertsReport } from './src/pr-alerts-report.js';


const context = github.context;

async function main() {
  try {
    const token = core.getInput('TOKEN');
    const octokit = new github.getOctokit(token);
    const totalDays = core.getInput('days');
    const repos = core.getInput('repos');
    const path = core.getInput('path');
    const commentAlertsOnly = core.getInput('comment_alerts_only');

    let reportSummary = await alertsReport.createReport(repos, totalDays, commentAlertsOnly, path, context, octokit);
    return core.notice(reportSummary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

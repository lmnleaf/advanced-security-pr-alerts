import * as github from '@actions/github';
import * as core from '@actions/core';
import * as dotenv from 'dotenv';
import { alertsReport } from './src/pr-alerts-report.js';


const context = github.context;

async function main() {
  try {
    const token = core.getInput('TOKEN');
    const octokit = new github.getOctokit(token);
    const total_days = core.getInput('days');
    const repos = core.getInput('repos')

    let reportSummary = await alertsReport.createReport(repos, total_days, context, octokit);
    return core.notice(reportSummary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();

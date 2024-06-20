import * as github from '@actions/github';
import * as core from '@actions/core';
import * as dotenv from 'dotenv';
import { alertsReport } from './src/pr-alerts-report.js';


// const context = github.context;

async function main() {
  try {
    dotenv.config();
    const token = process.env.GH_PAT;
    // const token = core.getInput('GITHUB_TOKEN');
    const octokit = new github.getOctokit(token);
    const owner = 'org';
    const repos = ['repo'];

    let report = await alertsReport.createReport(owner, repos, octokit);
    console.log(report);
    // return core.notice(size);
  } catch (error) {
    console.log('EEK: ', error);
    // core.setFailed(error.message);
  }
}

main();

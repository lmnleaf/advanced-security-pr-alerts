const core = require('@actions/core');
const github = require('@actions/github');
const dotenv = require('dotenv');
const getComments = require('./src/get-comments.js');
const fs = require('fs');

// const context = github.context;

async function main() {
  try {
    dotenv.config();
    const token = process.env.GH_PAT;
    // const token = core.getInput('GITHUB_TOKEN');
    const octokit = new github.getOctokit(token);
    const owner = 'org';
    const repo = 'repo';

    const comments = await getComments(owner, repo, octokit);

    // return core.notice(size);
  } catch (error) {
    console.log('EEK: ', error);
    // core.setFailed(error.message);
  }
}

main();
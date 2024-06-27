import { processInput } from '../src/process-input.js';
import Moctokit from './support/moctokit.js';

describe("Process Input", function() {
  let context = { repo: { owner: 'org', repo: 'cool-repo' } };
  let repos = 'repo1,repo2';
  let totalDays = 30;
  let path = 'path/to/file';
  let commentAlertsOnly = true;
  let octokit;

  beforeEach(function() {
    octokit = new Moctokit();
  });

  it('processes input when no repos and no days are provided (defaults to current repo and 30 days)', async function() {
    const input = processInput(null, null, null, context);
    expect(input.owner).toEqual('org');
    expect(input.repos).toEqual(['cool-repo']);
    expect(input.totalDays).toEqual(30);
    expect(input.commentAlertsOnly).toEqual(true);
  });

  it('processes input when repos and days are empty strings (defaults to current repo and 30 days)', async function() {
    const input = processInput('', '', null, context);
    expect(input.owner).toEqual('org');
    expect(input.repos).toEqual(['cool-repo']);
    expect(input.totalDays).toEqual(30);
    expect(input.commentAlertsOnly).toEqual(true);
  });

  it('processes input when repos and days are provided', async function() {
    const input = processInput('woot,cool', 10, null, context);
    expect(input.owner).toEqual(context.repo.owner);
    expect(input.repos).toEqual(['woot', 'cool']);
    expect(input.totalDays).toEqual(10);
    expect(input.commentAlertsOnly).toEqual(true);
  });

  it('processes input when repos is set to `all`', async function() {
    const input = processInput('all', null, null, context);
    expect(input.owner).toEqual(context.repo.owner);
    expect(input.repos).toEqual(['all']);
    expect(input.totalDays).toEqual(totalDays);
    expect(input.commentAlertsOnly).toEqual(commentAlertsOnly);
  });

  it('processes input when commentAlertsOnly is set to true', async function() {
    const input = processInput(null, null, true, context);
    expect(input.owner).toEqual(context.repo.owner);
    expect(input.repos).toEqual([context.repo.repo]);
    expect(input.totalDays).toEqual(totalDays);
    expect(input.commentAlertsOnly).toEqual(true);
  });

  it('processes input when commentAlertsOnly is set to false', async function() {
    const input = processInput(null, null, false, context);
    expect(input.owner).toEqual(context.repo.owner);
    expect(input.repos).toEqual([context.repo.repo]);
    expect(input.totalDays).toEqual(totalDays);
    expect(input.commentAlertsOnly).toEqual(false);
  });

  it('processes input when days is set to greater than 365 (defaults to 30 days)', async function() {
    let caughtError;
    let expectedError = new Error('total_days must be greater than 0 and less than or equal to 365.');

    try {
      processInput(null, 500, null, context);
    } catch (error) {
      caughtError = expectedError;
    }
  });

  it('processes input when days is set to fewer than 1 (defaults to 30 days)', async function() {
    let caughtError;
    let expectedError = new Error('total_days must be greater than 0 and less than or equal to 365.');

    try {
      processInput(null, 0, null, context);
    } catch (error) {
      caughtError = expectedError;
    }
  });

  it('throws an error when commentAlertsOnly is set to something other than true or false', async function() {
    let caughtError;
    let expectedError = new Error('comment_alerts_only must be true or false.');

    try {
      processInput(null, null, 'woot', context);
    } catch (error) {
      caughtError = expectedError;
    }
  });
});

import { repoPRs } from '../src/repo-prs.js';
import { orgRepos } from '../src/org-repos.js';
import { commentAlertNumbers } from '../src/comment-alert-numbers.js';
import { commentAlerts } from '../src/comment-alerts.js';
import Moctokit from './support/moctokit.js';

describe("Comment Alerts", function() {
  let octokit;
  let getPRsOriginal;
  let getOrgReposOriginal;
  let getNumbersOriginal;
  let owner = 'org';
  let totalDays = 30;
  let prData = [
    {
      repo: 'repo',
      number: 11,
      user: 'cool',
      state: 'closed',
      draft: false,
      merged_at: '2023-04-01T12:00:00Z',
      updated_at: '2023-04-02T12:00:00Z'
    },
    {
      repo: 'repo1',
      number: 10,
      user: 'wow',
      state: 'open',
      draft: false,
      merged_at: null,
      updated_at: '2023-04-02T12:00:00Z'
    }
  ]

  beforeEach(() => {
    octokit = new Moctokit();

    getPRsOriginal = repoPRs.getPRs;
    repoPRs.getPRs = jasmine.createSpy('getPRs').and.returnValue(Promise.resolve(prData));

    getOrgReposOriginal = orgRepos.getOrgRepos;
    orgRepos.getOrgRepos = jasmine.createSpy('getOrgRepos').and.returnValue(
      Promise.resolve([ { name: 'repo' }, { name: 'repo1' } ])
    );

    getNumbersOriginal = commentAlertNumbers.getNumbers;
    commentAlertNumbers.getNumbers = jasmine.createSpy('getNumbers').and.returnValue(
      Promise.resolve([ { pr: 'NA', repo: 'NA', alertNumber: 43 } ])
    );
  });

  afterEach(() => {
    // reset to original module function, so doesn't affect other tests
    repoPRs.getPRs = getPRsOriginal;
    orgRepos.getOrgRepos = getOrgReposOriginal;
    commentAlertNumbers.getNumbers = getNumbersOriginal;
  });

  it ('gets alerts from a list of PRs', async function() {
    let repos = ['repo', 'repo1', 'repo2'];

    const alerts = await commentAlerts.getAlerts(owner, repos, totalDays, octokit);

    expect(repoPRs.getPRs).toHaveBeenCalledWith(owner, 'repo', 30, octokit);
    expect(repoPRs.getPRs.calls.count()).toEqual(3);

    expect(alerts[0].number).toEqual(43);
    expect(alerts[0].pr.repo).toEqual('repo');
    expect(alerts[0].inPRComment).toEqual(true);
    expect(alerts[1].number).toEqual(43);
    expect(alerts[1].pr.repo).toEqual('repo1');
    expect(alerts[1].inPRComment).toEqual(true);
  });

  it('gets alerts from all repos in an org when repos is set to `all`', async function() {
    let repos = [];

    const alerts = await commentAlerts.getAlerts(owner, ['all'], totalDays, octokit);

    expect(orgRepos.getOrgRepos).toHaveBeenCalled();
    expect(repoPRs.getPRs).toHaveBeenCalled();

    expect(alerts[0].number).toEqual(43);
    expect(alerts[0].pr.repo).toEqual('repo');
    expect(alerts[1].pr.repo).toEqual('repo1');
    expect(alerts[1].number).toEqual(43);
  });

  it('sets the pr values on the alert', async function() {
    let repos = ['repo'];

    const alerts = await commentAlerts.getAlerts(owner, repos, totalDays, octokit)

    expect(alerts[0].number).toEqual(43);
    expect(alerts[0].pr.repo).toEqual('repo');
    expect(alerts[0].pr.user).toEqual('cool');
    expect(alerts[0].pr.state).toEqual('closed');
    expect(alerts[0].pr.draft).toEqual(false);
    expect(alerts[0].pr.mergedAt).toEqual('2023-04-01T12:00:00Z');
    expect(alerts[0].pr.updatedAt).toEqual('2023-04-02T12:00:00Z');
  });


  it('handles errors', async function() {
    let repos = ['repo1'];
    let caughtError;

    spyOn(octokit.rest.codeScanning, 'getAlert').and.throwError('fetch error');

    try {
      await commentAlerts.getAlerts(owner, repos, totalDays, octokit);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});

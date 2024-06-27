import { prList } from '../src/pr-list.js';
import { commentAlertNumbers } from '../src/comment-alert-numbers.js';
import { commentAlerts } from '../src/comment-alerts.js';
import Moctokit from './support/moctokit.js';

describe("Comment Alerts", function() {
  let octokit;
  let getPRsOriginal;
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

    getPRsOriginal = prList.getPRs;
    prList.getPRs = jasmine.createSpy('getPRs').and.returnValue(Promise.resolve(prData));

    getNumbersOriginal = commentAlertNumbers.getNumbers;
    commentAlertNumbers.getNumbers = jasmine.createSpy('getNumbers').and.returnValue(
      Promise.resolve([ { pr: 'NA', repo: 'NA', alertNumber: 43 } ])
    );
  });

  afterEach(() => {
    // reset to original module function, so doesn't affect other tests
    prList.getPRs = getPRsOriginal;
    commentAlertNumbers.getNumbers = getNumbersOriginal;
  });

  it ('gets alerts from a list of PRs', async function() {
    let repos = ['repo', 'repo1', 'repo2'];

    const alerts = await commentAlerts.getAlerts(owner, repos, totalDays, octokit);

    expect(prList.getPRs).toHaveBeenCalledWith(owner, repos, 30, octokit);

    expect(alerts[0].number).toEqual(43);
    expect(alerts[0].pr.repo).toEqual('repo');
    expect(alerts[0].inPRComment).toEqual(true);
    expect(alerts[1].number).toEqual(43);
    expect(alerts[1].pr.repo).toEqual('repo1');
    expect(alerts[1].inPRComment).toEqual(true);
  });

  it('gets alerts from all repos in an org when repos is set to `all`', async function() {
    const alerts = await commentAlerts.getAlerts(owner, ['all'], totalDays, octokit);

    expect(prList.getPRs).toHaveBeenCalledWith(owner, ['all'], 30, octokit);

    expect(alerts[0].number).toEqual(43);
    expect(alerts[0].pr.repo).toEqual('repo');
    expect(alerts[1].pr.repo).toEqual('repo1');
    expect(alerts[1].number).toEqual(43);
  });

  it('sets the pr values on the alert', async function() {
    const alerts = await commentAlerts.getAlerts(owner, ['repo'], totalDays, octokit)

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

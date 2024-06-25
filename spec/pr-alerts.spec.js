import { repoPRs } from '../src/repo-prs.js';
import { orgRepos } from '../src/org-repos.js';
import { prAlerts } from '../src/pr-alerts.js';
import Moctokit from './support/moctokit.js';

describe("PR Alerts", function() {
  let octokit;
  let getPRsOriginal;
  let getOrgReposOriginal;
  let owner = 'org';
  let totalDays = 30;
  let mockData = [
    {
      number: 43,
      rule: {
        id: "rule-123",
        security_severity_level: "high",
        severity: "critical",
        description: "This rule detects SQL injection vulnerabilities."
      },
      state: "open",
      most_recent_instance: {
        state: "active",
        ref: "refs/heads/main",
        commit_sha: "a1b2c3d4e5f6",
        location: {
          path: "/src/database/queries.js"
        }
      },
      tool: {
        name: "CodeScanner",
        version: "1.0.0"
      },
      dismissed_at: null,
      dismissed_by: null,
      dismissed_reason: null,
      dismissed_comment: null,
      fixed_at: "2024-05-01T12:00:00Z",
      created_at: "2023-04-01T12:00:00Z",
      updated_at: "2023-04-02T12:00:00Z"
    },
    {
      number: 42,
      rule: {
        id: "rule-124",
        security_severity_level: "high",
        severity: "critical",
        description: "This rule detects log injection vulnerabilities."
      },
      state: "open",
      most_recent_instance: {
        state: "active",
        ref: "refs/heads/main",
        commit_sha: "a1b5l3d4e5f6",
        location: {
          path: "/src/database/queries.js"
        }
      },
      tool: {
        name: "CodeScanner",
        version: "1.0.0"
      },
      dismissed_at: null,
      dismissed_by: null,
      dismissed_reason: null,
      dismissed_comment: null,
      fixed_at: null,
      created_at: "2023-04-15T12:00:00Z",
      updated_at: "2023-04-15T12:00:00Z"
    },
    {
      number: 41,
      rule: {
        id: "rule-124",
        security_severity_level: "high",
        severity: "critical",
        description: "This rule detects log injection vulnerabilities."
      },
      state: "open",
      most_recent_instance: {
        state: "active",
        ref: "refs/heads/main",
        commit_sha: "a1b4p7z4e5f6",
        location: {
          path: "/src/database/queries.js"
        }
      },
      tool: {
        name: "CodeScanner",
        version: "1.0.0"
      },
      dismissed_at: "2024-05-01T12:00:00Z",
      dismissed_by: 'cool',
      dismissed_reason: 'used in specs',
      dismissed_comment: 'This is used in specs',
      fixed_at: null,
      created_at: "2023-04-15T12:00:00Z",
      updated_at: "2023-04-15T12:00:00Z"
    }
  ]

  beforeEach(() => {
    octokit = new Moctokit(mockData);

    // NOTE: I've changed the export code in repo-prs.js to return a constant in order to make it
    // easier to mock the function, getPRs, that's inside the ES module. Although this is not best
    // practice, it is useful for testing purposes, and in this case, seemed like the simplest
    // option without too many superflous code changes. I got the idea from this article:
    // https://javascript.plainenglish.io/unit-testing-challenges-with-modulary-javascript-patterns
    // It was a huge help in understanding why I was having trouble testing the code and some
    // options for dealing with the challenges.
    getPRsOriginal = repoPRs.getPRs;
    repoPRs.getPRs = jasmine.createSpy('getPRs').and.returnValue(
      Promise.resolve([
        {
          repo: 'repo',
          number: 10,
          user: 'cool',
          state: 'closed',
          draft: false,
          merged_at: '2023-04-01T12:00:00Z',
          updated_at: '2023-04-02T12:00:00Z'
        },
        {
          repo: 'repo1',
          number: 9,
          user: 'wow',
          state: 'open',
          draft: false,
          merged_at: null,
          updated_at: '2023-04-02T12:00:00Z'
        },
        {
          repo: 'repo2',
          number: 8,
          user: 'yip',
          state: 'open',
          draft: true,
          merged_at: null,
          updated_at: '2023-04-02T12:00:00Z'
        }
      ])
    );

    getOrgReposOriginal = orgRepos.getOrgRepos;
    orgRepos.getOrgRepos = jasmine.createSpy('getOrgRepos').and.returnValue(
      Promise.resolve([
        {
          name: 'repo',
          type: 'private'
        },
        {
          name: 'repo1',
          type: 'public'
        },
        {
          name: 'repo2',
          type: 'internal'
        }
      ])
    );
  });

  afterEach(() => {
    // reset to original module function, so doesn't affect other tests
    repoPRs.getPRs = getPRsOriginal;
    orgRepos.getOrgRepos = getOrgReposOriginal;
  });

  it ('gets alerts from a list of PRs', async function() {
    let repos = ['repo', 'repo1', 'repo2'];

    const alerts = await prAlerts.getAlerts(owner, repos, totalDays, octokit);

    // TO DO: this is not very well tested. Would like to test the arguments
    // passed to paginate.
    expect(octokit.paginate).toHaveBeenCalled();
    expect(octokit.paginate.calls.count()).toEqual(18);
    expect(repoPRs.getPRs).toHaveBeenCalledWith(owner, 'repo', 30, octokit);

    expect(alerts[0].number).toEqual(43);
    expect(alerts[0].pr.repo).toEqual('repo');
    expect(alerts[1].number).toEqual(42);
    expect(alerts[8].number).toEqual(41);
    expect(alerts[8].pr.repo).toEqual('repo1');
    expect(alerts[9].number).toEqual(43);
  });

  it('gets alerts from all repos in an org when repos is set to `all`', async function() {
    let repos = [];

    const alerts = await prAlerts.getAlerts(owner, ['all'], totalDays, octokit);

    expect(octokit.paginate).toHaveBeenCalled();
    expect(octokit.paginate.calls.count()).toEqual(18);
    expect(orgRepos.getOrgRepos).toHaveBeenCalled();
    expect(repoPRs.getPRs).toHaveBeenCalled();

    expect(alerts[0].number).toEqual(43);
    expect(alerts[0].pr.repo).toEqual('repo');
    expect(alerts[1].number).toEqual(42);
    expect(alerts[8].number).toEqual(41);
    expect(alerts[8].pr.repo).toEqual('repo1');
    expect(alerts[9].number).toEqual(43);
  });

  it('continues to next PR if no analysis found', async function() {
    let repos = ['repo', 'repo1'];
    let caughtError = null;
    let octokitTestError = new Moctokit([], true, 'no analysis found');

    try {
      await prAlerts.getAlerts(owner, repos, totalDays, octokitTestError);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeNull();
  });

  it('handles errors', async function() {
    let repos = ['repo1', 'repo2'];
    let caughtError;
    let octokitTestError = new Moctokit([], true);

    try {
      await prAlerts.getAlerts(owner, repos, totalDays, octokitTestError);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});

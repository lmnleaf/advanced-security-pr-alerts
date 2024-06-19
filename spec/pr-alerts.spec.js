import { repoPRs } from '../src/repo-prs.js';
import getAlerts from '../src/pr-alerts.js';
import Moctokit from './support/moctokit.js';

describe("PR Alerts", function() {
  let octokit;
  let getPRsOriginal;
  let owner = 'org';
  let repo = 'repo';
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
          repo: 'repo',
          number: 9,
          user: 'wow',
          state: 'open',
          draft: false,
          merged_at: null,
          updated_at: '2023-04-02T12:00:00Z'
        },
        {
          repo: 'repo',
          number: 8,
          user: 'yip',
          state: 'open',
          draft: true,
          merged_at: null,
          updated_at: '2023-04-02T12:00:00Z'
        }
      ])
    );
  });

  afterEach(() => {
    repoPRs.getPRs = getPRsOriginal;
  });

  it ('gets alerts from the PRs', async function() {
    const alerts = await getAlerts(owner, repo, octokit);

    expect(alerts.length).toBe(9);
    expect(alerts[0].number).toBe(43);
    expect(alerts[1].number).toBe(42);
    expect(alerts[2].number).toBe(41);
  });

  it('handles errors', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('fetch error'));
    });

    try {
      await getAlerts(owner, repo, octokit);
    } catch (error) {
      expect(error).toEqual(new Error('fetch error'));
    }
  })
});
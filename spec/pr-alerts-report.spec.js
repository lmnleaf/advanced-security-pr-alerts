import { alertsReport } from '../src/pr-alerts-report.js';
import { repoPRs } from '../src/repo-prs.js';
import Moctokit from './support/moctokit.js';

describe("Alerts Report", function() {
  let octokit;
  let getPRsOriginal;
  let owner = 'org';
  let repos = ['repo'];
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
    getPRsOriginal = repoPRs.getPRs;

    // NOTE: Please see notes about why I've set up the exports and
    // mocks this way in the pr-alerts.spec.js file.
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

    alertsReport.writeFile = jasmine.createSpy('writeFile').and.callFake((path, data, callback) => {
      callback(null); // Simulate successful write operation
    });
  });

  afterEach(() => {
    repoPRs.getPRs = getPRsOriginal;
  });

  it ('creates a CSV of alerts', async function() {
    await alertsReport.createReport(owner, repos, octokit);

    expect(repoPRs.getPRs).toHaveBeenCalled();
    expect(alertsReport.writeFile).toHaveBeenCalled();

    const args = alertsReport.writeFile.calls.mostRecent().args;
    const filePath = args[0];
    const fileContent = args[1];

    expect(filePath).toContain('temp/repo-pr-alerts-report-');

    const lines = fileContent.split('\n');

    expect(lines.length).toBe(10);
    expect(lines[0]).toContain(
      'number,rule_id,rule_security_severity_level,rule_severity,description,state,' +
      'most_recent_instance_state,most_recent_instance_ref,most_recent_commit_sha,most_recent_instance_path,' + 
      'tool,tool_version,' + 
      'fixed_at,' + 
      'dismissed_at,dismissed_by,dismissed_reason,dismissed_comment,' +
      'created_at,updated_at,' +
      'repo,pr_number,pr_user,pr_state,pr_draft,pr_merged_at,pr_updated_at'
    );
    expect(lines[1]).toContain(
      '43,rule-123,high,critical,This rule detects SQL injection vulnerabilities.,open,' +
      'active,refs/heads/main,a1b2c3d4e5f6,/src/database/queries.js,' +
      'CodeScanner,1.0.0,' +
      '2024-05-01T12:00:00Z,' +
      ',,,,' +
      '2023-04-01T12:00:00Z,2023-04-02T12:00:00Z,' +
      'repo,10,cool,closed,false,2023-04-01T12:00:00Z,2023-04-02T12:00:00Z'
    );
  });

  it ('returns alert info', async function() {
    const alertNumbers = await alertsReport.createReport(owner, repos, octokit);

    expect(alertNumbers.length).toBe(9);
    expect(alertNumbers).toEqual([
      { repo: 'repo', number: 43 },
      { repo: 'repo', number: 42 },
      { repo: 'repo', number: 41 },
      { repo: 'repo1', number: 43 },
      { repo: 'repo1', number: 42 },
      { repo: 'repo1', number: 41 },
      { repo: 'repo2', number: 43 },
      { repo: 'repo2', number: 42 },
      { repo: 'repo2', number: 41 }
    ]);
  });

  it('handles errors', async function() {
    let repos = ['repo1', 'repo2'];
    let caughtError;
    let octokitTestError = new Moctokit([], true);

    try {
      await alertsReport.createReport(owner, repos, octokitTestError);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});

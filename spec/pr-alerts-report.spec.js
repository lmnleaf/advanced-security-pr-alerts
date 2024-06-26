import { alertsReport } from '../src/pr-alerts-report.js';
import { prAlerts } from '../src/pr-alerts.js';
import Moctokit from './support/moctokit.js';

describe("Alerts Report", function() {
  let octokit;
  let getAlertsOriginal;
  let owner = 'org';
  let repos = [ 'repo' ];
  let totalDays = null;
  let includeRefAlerts = null;
  let path = '/home/runner/work/this-repo/this-repo';
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
      inPRComment: false,
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
        version: null
      },
      pr: {
        repo: 'repo',
        number: 12,
        user: 'cool',
        state: 'closed',
        draft: false,
        mergedAt: "2023-04-01T12:00:00Z",
        updatedAt: "2023-04-02T12:00:00Z"
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
      inPRComment: false,
      most_recent_instance: {
        state: "active",
        ref: "refs/heads/main",
        commit_sha: "a1b5l3d4e5f6",
        location: {
          path: "/src/database/queries.js"
        }
      },
      tool: {
        name: null,
        version: "1.0.0"
      },
      pr: {
        repo: 'repo2',
        number: 11,
        user: 'cool',
        state: 'open',
        draft: false,
        mergedAt: null,
        updatedAt: "2023-04-15T12:00:00Z"
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
      inPRComment: true,
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
      pr: {
        repo: 'repo',
        number: 10,
        user: 'cool',
        state: 'open',
        draft: false,
        mergedAt: null,
        updatedAt: "2023-04-02T12:00:00Z"
      },
      dismissed_at: "2024-05-01T12:00:00Z",
      dismissed_by: { login: 'cool' },
      dismissed_reason: 'used in specs',
      dismissed_comment: 'This is used in specs',
      fixed_at: null,
      created_at: "2023-04-15T12:00:00Z",
      updated_at: "2023-04-15T12:00:00Z"
    }
  ]

  beforeEach(() => {
    octokit = new Moctokit();

    getAlertsOriginal = prAlerts.getAlerts;

    alertsReport.writeFile = jasmine.createSpy('writeFile').and.callFake((path, data, callback) => {
      callback(null); // Simulate successful write operation
    });
  });

  afterEach(() => {
    // reset to original module function, so doesn't affect other tests
    prAlerts.getAlerts = getAlertsOriginal;
  });

 it ('creates a CSV of alerts', async function() {
    spyOn(prAlerts, 'getAlerts').and.returnValue(Promise.resolve(mockData));

    await alertsReport.createReport(owner, repos, totalDays, includeRefAlerts, path, octokit);

    expect(prAlerts.getAlerts).toHaveBeenCalledWith(owner, repos, totalDays, includeRefAlerts, octokit);
    expect(alertsReport.writeFile).toHaveBeenCalled();

    const args = alertsReport.writeFile.calls.mostRecent().args;
    const filePath = args[0];
    const fileContent = args[1];

    expect(filePath).toContain('/home/runner/work/this-repo/this-repo/pr-alerts-report.csv');

    const lines = fileContent.split('\n');

    expect(lines.length).toBe(4);
    expect(lines[0]).toContain(
      'number,rule_id,rule_security_severity_level,rule_severity,description,state,' +
      'repo,in_pr_comment,' +
      'pr_number,pr_user,pr_state,pr_draft,pr_merged_at,pr_updated_at,' +
      'most_recent_instance_state,most_recent_instance_ref,most_recent_commit_sha,most_recent_instance_path,' + 
      'tool,tool_version,' + 
      'fixed_at,' + 
      'dismissed_at,dismissed_by,dismissed_reason,dismissed_comment,' +
      'created_at,updated_at'
    );
    expect(lines[1]).toContain(
      '43,rule-123,high,critical,This rule detects SQL injection vulnerabilities.,open,' +
      'repo,false,' +
      '12,cool,closed,false,2023-04-01T12:00:00Z,2023-04-02T12:00:00Z,' +
      'active,refs/heads/main,a1b2c3d4e5f6,/src/database/queries.js,' +
      'CodeScanner,,' +
      '2024-05-01T12:00:00Z,' +
      ',,,,' +
      '2023-04-01T12:00:00Z,2023-04-02T12:00:00Z'
    );
    expect(lines[2]).toContain(
      '42,rule-124,high,critical,This rule detects log injection vulnerabilities.,open,' +
      'repo2,false,' +
      '11,cool,open,false,,2023-04-15T12:00:00Z,' +
      'active,refs/heads/main,a1b5l3d4e5f6,/src/database/queries.js,' +
      ',1.0.0,' +
      ',,,,,' +
      '2023-04-15T12:00:00Z,2023-04-15T12:00:00Z'
    );
    expect(lines[3]).toContain(
      '41,rule-124,high,critical,This rule detects log injection vulnerabilities.,open,' +
      'repo,true,' +
      '10,cool,open,false,,2023-04-02T12:00:00Z,' +
      'active,refs/heads/main,a1b4p7z4e5f6,/src/database/queries.js,' +
      'CodeScanner,1.0.0,' +
      ',' +
      '2024-05-01T12:00:00Z,cool,used in specs,This is used in specs,' +
      '2023-04-15T12:00:00Z,2023-04-15T12:00:00Z'
    );
  });

  it ('returns a report summary', async function() {
    spyOn(prAlerts, 'getAlerts').and.returnValue(Promise.resolve(mockData));

    const reportSummary= await alertsReport.createReport(owner, repos, totalDays, includeRefAlerts, path, octokit);

    expect(reportSummary).toEqual(
      'Total PR alerts found: 3. \n' +
      'All org repos reviewed: false. \n' +
      'Repos reviewed: repo.'
    );
  });

  it ('returns a report summary when the report covers all org repos', async function() {
    spyOn(prAlerts, 'getAlerts').and.returnValue(Promise.resolve(mockData));

    const reportSummary= await alertsReport.createReport(owner, ['all'], totalDays, includeRefAlerts, path, octokit);

    expect(reportSummary).toEqual(
      'Total PR alerts found: 3. \n' +
      'All org repos reviewed: true. \n' +
      'Repos reviewed: all.'
    );
  });

  it('returns a report summary when there are no PR alerts', async function() {
    spyOn(prAlerts, 'getAlerts').and.returnValue(Promise.resolve([]));
    const reportSummary= await alertsReport.createReport(owner, repos, totalDays, includeRefAlerts, path, octokit);

    expect(reportSummary).toEqual(
      'No PR alerts found.'
    );
  });

  it('handles errors', async function() {
    let repos = 'repo1,repo2';
    let caughtError;
    spyOn(prAlerts, 'getAlerts').and.returnValue(Promise.reject(new Error('fetch error')));

    try {
      await alertsReport.createReport(owner, repos, null, includeRefAlerts, path, octokit);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});

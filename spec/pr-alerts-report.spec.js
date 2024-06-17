const repoPRs = require('../src/repo-prs.js');
const createReport = require('../src/pr-alerts-report.js');
const fs = require('fs');
const Moctokit = require('./support/moctokit.js');

describe("Repo Alerts", function() {
  let octokit;
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

    spyOn(repoPRs, 'getPRs').and.returnValue(
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

  it ('creates a CSV of alerts', async function() {
    spyOn(fs, 'writeFile').and.callFake((path, data, callback) => {
      callback(null); // Simulate successful write operation
    });

    await createReport(owner, repo, octokit);

    const args = fs.writeFile.calls.mostRecent().args;
    const filePath = args[0];
    const fileContent = args[1];

    expect(fs.writeFile).toHaveBeenCalled();
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
      'repo,8,,open,,,2023-04-02T12:00:00Z'
    );
  });

  it ('returns an array of alert numbers', async function() {
    spyOn(fs, 'writeFile').and.returnValue(null);

    const prAlertsReport = await createReport(owner, repo, octokit);

    expect(prAlertsReport.length).toBe(9);
    expect(prAlertsReport).toEqual([43, 42, 41, 43, 42, 41, 43, 42, 41]);
  });

  it('handles errors', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('fetch error'));
    });

    try {
      await createReport(owner, repo, octokit);
    } catch (error) {
      expect(error).toEqual(new Error('fetch error'));
    }
  })      
});
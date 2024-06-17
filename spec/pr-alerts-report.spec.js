const repoPRs = require('../src/repo-prs.js');
const prComments = require('../src/pr-comments.js');
const getAlerts = require('../src/pr-alerts.js');
const createReport = require('../src/pr-alerts-report.js');
const fs = require('fs');
const Moctokit = require('./support/moctokit.js');

describe("Repo Alerts", function() {
  let octokit;
  let owner = 'org';
  let repo = 'repo';

  beforeEach(() => {
    octokit = new Moctokit();

    spyOn(repoPRs, 'getPRs').and.returnValue(
      Promise.resolve([
        { number: 10 },
        { number: 9 },
        { number: 8 }
      ]) 
    );
    spyOn(prComments, 'getComments').and.returnValue(
      Promise.resolve([
        { body: "## Query built from user-controlled sources\n\nThis query depends on a [user-provided value](1).\n\n" +
          "[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/43)" },
        {       body: "## Log injection\n\nThis This log entry depends on a [user-provided value](1).\n\n" +
          "[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/44) wow" },
        { body: "## Query built from user-controlled sources\n\nThis query depends on a [user-provided value](1).\n\n" +
          "[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/54)woot woot" }
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

    expect(lines.length).toBe(4);
    expect(lines[0]).toContain(
      'number,rule_id,rule_security_severity_level,rule_severity,description,state,' +
      'most_recent_instance_state,most_recent_instance_ref,most_recent_commit_sha,most_recent_instance_path,' + 
      'tool,tool_version,' + 
      'fixed_at,' + 
      'dismissed_at,dismissed_by,dismissed_reason,dismissed_comment,' +
      'created_at,updated_at'
    );
    expect(lines[1]).toContain(
      '43,rule-123,high,critical,This rule detects SQL injection vulnerabilities.,open,' + 
      'active,refs/heads/main,a1b2c3d4e5f6,/src/database/queries.js,' + 
      'CodeScanner,1.0.0,' + 
      '2024-05-01T12:00:00Z,' +
      ',,,,' + 
      '2023-04-01T12:00:00Z,2023-04-02T12:00:00Z'
    );
  });

  it ('returns an array of alert numbers', async function() {
    spyOn(fs, 'writeFile').and.returnValue(null);

    const prAlertsReport = await createReport(owner, repo, octokit);

    expect(prAlertsReport.length).toBe(3);
    expect(prAlertsReport).toEqual([43, 43, 43]);
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
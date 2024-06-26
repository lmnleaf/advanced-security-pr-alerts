import { prAlerts } from '../src/pr-alerts.js';
import { refAlerts } from '../src/ref-alerts.js';
import Moctokit from './support/moctokit.js';

describe("PR Alerts", function() {
  let octokit;
  let getRefAlertsOriginal;
  let owner = 'org';
  let repos = ['repo', 'repo1'];
  let totalDays = 30;

  beforeEach(() => {
    octokit = new Moctokit();
    getRefAlertsOriginal = refAlerts.getAlerts;
    refAlerts.getAlerts = jasmine.createSpy('getAlerts').and.returnValue(
      Promise.resolve([
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
          pr: {
            repo: 'repo',
            number: 10,
            user: 'coolcool',
            state: 'open',
            draft: false,
            merged_at: null,
            updated_at: "2023-04-01T12:00:00Z"
          },
          dismissed_at: "2024-05-01T12:00:00Z",
          dismissed_by: 'cool',
          dismissed_reason: 'used in specs',
          dismissed_comment: 'This is used in specs',
          fixed_at: null,
          created_at: "2023-04-15T12:00:00Z",
          updated_at: "2023-04-15T12:00:00Z"
        }
      ])
    );
  });

  afterEach(() => {
    // reset to original module function, so doesn't affect other tests
    refAlerts.getAlerts = getRefAlertsOriginal;
  });

  it ('gets ref alerts when commentAlertsOnly is false', async function() {
    const alerts = await prAlerts.getAlerts(owner, repos, totalDays, false, octokit);

    expect(refAlerts.getAlerts).toHaveBeenCalledWith(owner, repos, totalDays, octokit);
    expect(alerts[0].number).toEqual(41);
    expect(alerts[0].pr.repo).toEqual('repo');
  });

  it('handles errors', async function() {
    refAlerts.getAlerts = jasmine.createSpy('getAlerts').and.returnValue(
      Promise.reject(new Error('fetch error'))
    );
    // let repos = ['repo1', 'repo2'];
    let caughtError;
    // let octokitTestError = new Moctokit([], true);

    try {
      await prAlerts.getAlerts(owner, repos, totalDays, false, octokit);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});

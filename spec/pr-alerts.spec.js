const repoPRs = require('../src/repo-prs.js');
const prComments = require('../src/pr-comments.js');
const getAlerts = require('../src/pr-alerts.js');
const Moctokit = require('./support/moctokit.js');

describe("Repo Alerts", function() {
  let octokit;
  let owner = 'org';
  let repo = 'repo';

  beforeEach(() => {
    octokit = new Moctokit();
  });

  it ('gets alerts from the review comments by the bot', async function() {
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

    const alerts = await getAlerts(owner, repo, octokit);

    expect(alerts.length).toBe(3);
    for (let i = 0; i < alerts.length; i++) {
      expect(alerts[i].number).toEqual(43);
    }
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
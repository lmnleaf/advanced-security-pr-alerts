import { commentAlertNumbers } from '../src/comment-alert-numbers.js';
import Moctokit from './support/moctokit.js';

describe("Comment Alert Numbers", function() {
  let octokit;
  let owner = 'org';
  let mockData = [
    { 
      user: { login: 'github-advanced-security[bot]' },
      body: '## Query built from user-controlled sources\n\nThis query depends on a [user-provided value](1).\n\n' +
        '[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/43)' 
    },
    { 
      user: { login: 'github-advanced-security[bot]' },
      body: '## Log injection\n\nThis This log entry depends on a [user-provided value](1).\n\n' +
        '[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/44) wow' 
    },
    {
      user: { login: 'cool' },
      body: 'Logic looks good!'
    },
    { 
      user: { login: 'github-advanced-security[bot]' },
      body: '## Query built from user-controlled sources\n\nThis query depends on a [user-provided value](1).\n\n' +
        '[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/54)woot woot' 
    }, 
    {
      user: { login: 'github-advanced-security[bot]' },
      body: '## Some not good vulnerability\n\nWhere, for some reason, link to alert is missing number.\n\n' +
        '[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/a)' 
    }
  ]
  let pr = {
      repo: 'repo',
      number: 11,
      user: { login: 'dependabot[bot]' },
      state: 'open',
      merged_at: null,
      updated_at: '2023-04-15T12:00:00Z',
    };

  beforeEach(() => {
    octokit = new Moctokit(mockData);
  });

  it ('gets alert numbers from the review comments left by the advanced security bot', async function() {
    const alertNumbers = await commentAlertNumbers.getNumbers(owner, pr, octokit);

    expect(alertNumbers.length).toBe(3);
    expect(alertNumbers[0]).toEqual(43);
    expect(alertNumbers[1]).toEqual(44);
    expect(alertNumbers[2]).toEqual(54);
  });

  it('handles errors', async function() {
    let caughtError;
    let octokitTestError = new Moctokit([], true);

    try {
      await commentAlertNumbers.getNumbers(owner, pr, octokitTestError);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});

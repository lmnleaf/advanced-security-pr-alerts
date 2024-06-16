const getComments = require('../src/pr-comments.js');
const getPRs = require('../src/repo-prs.js');
const Moctokit = require('./support/moctokit.js');

describe("Get Comments", function() {
  let octokit;
  let owner = 'org';
  let repo = 'repo';
  let mockData = [
    { 
      user: { login: 'github-advanced-security[bot]' }, 
      body: "## Query built from user-controlled sources\n\nThis query depends on a [user-provided value](1).\n\n" +
      "[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/43)",
      updated_at: new Date().toISOString() 
    }, // Comment from bot
    { 
      user: { login: 'commenter1' }, 
      body: "looking good!", 
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 15)).toISOString() 
    }, // Comment from bot
    { 
      user: { login: 'github-advanced-security[bot]' }, 
      body: "## Log injection\n\nThis This log entry depends on a [user-provided value](1).\n\n" +
      "[Show more details](https://github.com/octodemo/turbo-octo-journey/security/code-scanning/44)",
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 31)).toISOString() 
    }, // Comment not from bot
    { 
      user: { login: 'commenter2' }, 
      body: "nit: add a space after the colon",
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 31)).toISOString() 
    } // Comment not from bot
  ]

  beforeEach(() => {
    octokit = new Moctokit(mockData);
  });

  it('gets PR comments for the past 30 days', async function () {
    spyOn(getPRs, 'getPRs').and.returnValue(
      Promise.resolve([
        { number: 10 },
        { number: 9 },
        { number: 8 }
      ]) 
    );

    const comments = await getComments(owner, repo, octokit);
    const pastDate = new Date(Date.now() - (24 * 60 * 60 * 1000 * 30));

    expect(octokit.paginate).toHaveBeenCalled();
    expect(comments.length).toBe(6); // Expecting 6 comments that were written by github-advanced-security[bot]
    for (let i = 0; i < comments.length; i++) {
      expect(comments[i].user).toEqual('github-advanced-security[bot]');
    }
  });

  it('handles errors', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('fetch error'));
    });

    try {
      await getComments(owner, repo, octokit);
    } catch (error) {
      expect(error).toEqual(new Error('fetch error'));
    }
  })
});
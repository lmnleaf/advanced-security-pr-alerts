const getComments = require('../src/get-comments.js');
const Moctokit = require('./support/moctokit.js');

describe("Get Comments", function() {
  let octokit;
  let owner = 'org';
  let repo = 'repo';
  let mockData = [
    { 
      user: { login: 'github-advanced-security[bot]' }, 
      pull_request_url: 'https://api.github.com/repos/org/repo/pulls/10', 
      created_at: new Date().toISOString() 
    }, // Comment from today
    { 
      user: { login: 'commenter1' }, 
      pull_request_url: 'https://api.github.com/repos/org/repo/pulls/9', 
      created_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 15)).toISOString() 
    }, // Comment from 15 days ago
    { 
      user: { login: 'commenter2' }, 
      pull_request_url: 'https://api.github.com/repos/org/repo/pulls/9', 
      created_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 17)).toISOString() 
    }, // Comment from 17 days ago
    { 
      user: { login: 'commenter2' }, 
      pull_request_url: 'https://api.github.com/repos/org/repo/pulls/7', 
      created_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 31)).toISOString() 
    } // Comment from 31 days ago
  ]

  beforeEach(() => {
    octokit = new Moctokit(mockData);
  });

  it('gets PR comments for the past 30 days', async function () {
    const comments = await getComments(owner, repo, octokit);

    expect(octokit.paginate).toHaveBeenCalled();
    expect(comments.length).toBe(3); // E xpecting 3 comments that are within the last 30 days
    expect(new Date(comments[0].created_at) <= new Date()).toBeTrue();
    expect(new Date(comments[1].created_at) <= new Date()).toBeTrue();
    expect(new Date(comments[2].created_at) <= new Date()).toBeTrue();
  });
});
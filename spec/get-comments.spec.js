const getComments = require('../src/get-comments.js');
const Moctokit = require('./support/moctokit.js');

describe("Get Comments", function() {
  let octokit = new Moctokit();
  let owner = 'org';
  let repo = 'repo';

  it('gets PR comments for the past 30 days', async function () {
    const comments = await getComments(owner, repo, octokit);

    expect(octokit.paginate).toHaveBeenCalled();
    expect(comments.length).toBe(3); // Expecting 2 comments that are within the last 30 days
    expect(new Date(comments[0].created_at) <= new Date()).toBeTrue();
    expect(new Date(comments[1].created_at) <= new Date()).toBeTrue();
    expect(new Date(comments[2].created_at) <= new Date()).toBeTrue();
  });
});
const repoPRs = require('./repo-prs');

async function getComments(owner, repo, octokit) {
  let comments = [];
  let prs = await repoPRs.getPRs(owner, repo, octokit);

  for (const pr of prs) {
    try {
      await octokit.paginate(
        octokit.rest.pulls.listReviewComments,
        {
          owner,
          repo,
          pull_number: pr.number,
          per_page: 5
        },
        (response) => {
          comments.push(...response.data);
        }
      );
    } catch (error) {
      throw error;
    }
  }

  comments = filterComments(comments).map((comment) => ({
    user: comment.user.login,
    body: comment.body
  }));

  return comments;
}

function filterComments (comments) {
  return comments.filter((comment) => comment.user.login === 'github-advanced-security[bot]');
}

module.exports = { getComments }
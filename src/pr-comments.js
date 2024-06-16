const getPRs = require('./repo-prs');

async function getComments(owner, repo, octokit) {
  var comments = [];
  var prs = await getPRs.getPRs(owner, repo, octokit);

  for (const pr of prs) {
    try {
      await octokit.paginate(
        octokit.rest.pulls.listReviewComments,
        {
          owner: 'octodemo',
          repo: 'upgraded-octo-eureka',
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
    body: comment.body,
    updated_at: comment.updated_at
  }));

  return comments;
}

function filterComments (comments) {
  return comments.filter((comment) => comment.user.login === 'github-advanced-security[bot]');
}

module.exports = getComments
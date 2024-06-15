async function getComments(owner, repo, octokit) {
  var comments = [];
  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(new Date().getDate() - 30);

  try {
    await octokit.paginate(
      octokit.rest.issues.listCommentsForRepo,
      {
        owner: owner,
        repo: repo,
        // per page should eventually be 100
        per_page: 5
      },
      (response, done) => {
        // stop on updated_at date
        stopListingComments = response.data.find((comment) => new Date(comment.updated_at) <= thirtyDaysAgo);
        if (stopListingComments) {
          done();
        }
        comments.push(...response.data);
      }
  )} catch (error) {
    throw error;
  }
  comments = comments.filter((comment) => new Date(comment.updated_at) > thirtyDaysAgo);
  return comments;
}

module.exports = getComments
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
        // stop on date or pr number
        stopListingComments = response.data.find((comment) => new Date(comment.created_at) <= thirtyDaysAgo);
        if (stopListingComments) {
          console.log('Created At on First Comment: ', response.data[0].created_at);
          done();
        }
        comments.push(...response.data);
      }
  )} catch (error) {
    // update this to throw error
    console.error('Error:', error);
  }
  comments = comments.filter((comment) => new Date(comment.created_at) > thirtyDaysAgo);
  return comments;
}

module.exports = getComments
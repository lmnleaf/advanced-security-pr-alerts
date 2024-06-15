async function getPRs(owner, repo, octokit) {
  var prs = [];
  const daysAgo = new Date();

  // make number of days an optional parameter
  // default 30
  daysAgo.setDate(new Date().getDate() - 30);

  try {
    await octokit.paginate(
      octokit.rest.pulls.list,
      {
        owner: owner,
        repo: repo,
        state: 'all',
        // per page should eventually be 100
        per_page: 5
      },
      (response, done) => {
        // stop on updated_at date
        stopListingPRs = response.data.find((pr) => new Date(pr.updated_at) <= daysAgo);
        if (stopListingPRs) {
          done();
        }
        prs.push(...response.data);
      }
  )} catch (error) {
    throw error;
  }

  prs = filteredPrs(prs, daysAgo).map((pr) => ({
    number: pr.number,
    user: pr.user.login,
    state: pr.state,
    merged_at: pr.merged_at,
    updated_at: pr.updated_at
  }));

  return prs;
}

function filteredPrs(prs, daysAgo) {
  return prs.filter((pr) => 
    new Date(pr.updated_at) >= daysAgo 
    // make drafts and closed but NOT merged an optional input parameter
    // && pr.draft != false
    // && (pr.state == 'open' || pr.state == 'closed' && pr.merged_at != null)
  );
}

module.exports = getPRs
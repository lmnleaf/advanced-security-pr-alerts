async function getPRs(owner, repo, totalDays, octokit) {
  let prs = [];
  const daysAgo = new Date();

  // make number of days an optional parameter
  daysAgo.setDate(new Date().getDate() - totalDays);

  try {
    await octokit.paginate(
      octokit.rest.pulls.list,
      {
        owner,
        repo,
        state: 'all',
        per_page: 100
      },
      (response, done) => {
        // stop on updated_at date
        let stopListingPRs = response.data.find((pr) => new Date(pr.updated_at) <= daysAgo);
        if (stopListingPRs) {
          done();
        }
        prs.push(...response.data);
      }
  )} catch (error) {
    throw error;
  }

  prs = filteredPrs(prs, daysAgo).map((pr) => ({
    repo: repo,
    number: pr.number,
    user: pr.user.login,
    state: pr.state,
    draft: pr.draft,
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

export const repoPRs = {
  getPRs: getPRs
}

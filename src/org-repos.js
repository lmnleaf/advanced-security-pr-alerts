async function getOrgRepos(org, octokit) {
  let repoNames = [];

  try {
    await octokit.paginate(
      octokit.rest.repos.listForOrg,
      { 
        org,
        per_page: 100
      },
      (response, done) => {
        repoNames.push(...response.data.map((repo) => repo.name));
      }
  )} catch (error) {
    throw error;
  }

  return repoNames;
}

export const orgRepos = {
  getOrgRepos: getOrgRepos
}

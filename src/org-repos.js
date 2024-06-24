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
        let advancedSecurityRepos = response.data.filter(
          (repo) => repo.security_and_analysis.advanced_security.status === 'enabled'
        );
        repoNames.push(...advancedSecurityRepos.map((repo) => repo.name));
      }
  )} catch (error) {
    throw error;
  }

  return repoNames;
}

export const orgRepos = {
  getOrgRepos: getOrgRepos
}

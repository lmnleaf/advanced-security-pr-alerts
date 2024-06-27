import { repoPRs } from './repo-prs.js';
import { orgRepos } from './org-repos.js';

async function getPRs(owner, repos, totalDays, octokit) {
  let reposList = [];

  if (repos.length === 1 && repos[0] === 'all') {
    reposList = await orgRepos.getOrgRepos(owner, octokit);
  } else {
    reposList = repos;
  }

  let prs = [];

  for (const repo of reposList) {
    let prList = await repoPRs.getPRs(owner, repo, totalDays, octokit);
    prs = prs.concat(prList);
  }

  return prs;
}

export const prList = {
  getPRs: getPRs
}

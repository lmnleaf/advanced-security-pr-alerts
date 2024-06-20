import { orgRepos } from '../src/org-repos.js';
import Moctokit from './support/moctokit.js';

describe("Org Repos", function() {
  let octokit;
  let owner = 'org';
  let mockData = [
    { name: 'repo1' },
    { name: 'repo2' },
    { name: 'repo3' }
  ]

  beforeEach(function() {
    octokit = new Moctokit(mockData);
  });

  it ('gets repos for an org', async function() {
    let repos = await orgRepos.getOrgRepos(owner, octokit);

    expect(repos).toEqual(['repo1', 'repo2', 'repo3']);
  });
});

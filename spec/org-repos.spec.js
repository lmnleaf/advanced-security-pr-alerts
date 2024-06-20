import { orgRepos } from '../src/org-repos.js';
import Moctokit from './support/moctokit.js';

describe("Org Repos", function() {
  let octokit;
  let owner = 'org';
  let mockData = [
    {
      name: 'repo1',
      security_and_analysis: {
        advanced_security: {
            status: "enabled"
        },
      }
    },
    {
      name: 'repo2',
      security_and_analysis: {
        advanced_security: {
            status: "enabled"
        },
      }
    },
    {
      name: 'repo3',
      security_and_analysis: {
        advanced_security: {
            status: "disabled"
        },
      }
    }
  ]

  beforeEach(function() {
    octokit = new Moctokit(mockData);
  });

  it ('gets repos for an org, including only those with Advanced Security enabled', async function() {
    let repos = await orgRepos.getOrgRepos(owner, octokit);

    expect(repos).toEqual(['repo1', 'repo2']);
  });
});

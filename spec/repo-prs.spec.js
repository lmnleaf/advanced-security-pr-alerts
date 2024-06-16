const getPRs = require('../src/repo-prs.js');
const Moctokit = require('./support/moctokit.js');

describe("Get PRs", function() {
  let octokit;
  let owner = 'org';
  let repo = 'repo';
  let mockData = [
    { 
      number: 10,
      user: { login: 'github-advanced-security[bot]' },
      state: 'open',
      merged_at: null,
      updated_at: new Date().toISOString() 
    }, // PR updated today
    { 
      number: 9,
      user: { login: 'PRauthor1' }, 
      state: 'open',
      merged_at: null,
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 15)).toISOString() 
    }, // PR updated 15 days ago
    { 
      number: 8,
      user: { login: 'PRauthor2' }, 
      state: 'closed',
      draft: false,
      merged_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 18)).toISOString(),
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 17)).toISOString() 
    }, // PR merged 18 days ago and updated 17 days ago
    { 
      number: 7,
      user: { login: 'PRauthor3' }, 
      state: 'closed',
      draft: true,
      merged_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 18)).toISOString(),
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 17)).toISOString() 
    }, // PR merged 18 days ago and updated 17 days ago
    { 
      number: 6,
      user: { login: 'PRauthor2' },
      state: 'open',
      draft: true,
      merged_at: null,
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 20)).toISOString()
    }, // PR updated 20 days ago
    { 
      number: 5,
      user: { login: 'PRauthor2' },
      state: 'closed',
      draft: false,
      merged_at: null,
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 20)).toISOString()
    }, // PR updated 20 days ago
    { 
      number: 4,
      user: { login: 'PRauthor2' },
      state: 'closed',
      draft: true,
      merged_at: null,
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 20)).toISOString()
    }, // PR updated 20 days ago
    { 
      number: 3,
      user: { login: 'PRauthor3' }, 
      state: 'closed',
      draft: false,
      merged_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 32)).toISOString(),
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 31)).toISOString() 
    }, // PR updated 31 days ago
    { 
      number: 2,
      user: { login: 'PRauthor3' }, 
      state: 'open',
      draft: false,
      merged_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 32)).toISOString(),
      updated_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 31)).toISOString() 
    } // PR updated 31 days ago
  ]

  beforeEach(() => {
    octokit = new Moctokit(mockData);
  });

  it('gets PRs for the past 30 days', async function () {
    const prs = await getPRs.getPRs(owner, repo, octokit);

    expect(octokit.paginate).toHaveBeenCalled();
    expect(prs.length).toBe(7); // Expecting 7 comments that are within the last 30 days
    for (let i = 0; i < prs.length; i++) {
      expect(new Date(prs[i].updated_at) <= new Date()).toBeTrue();
    }
  });

  it('handles errors', async function() {
    spyOn(globalThis, 'fetch').and.callFake(function() {
      return Promise.reject(new Error('fetch error'));
    });

    try {
      await getPRs.getPRs(owner, repo, octokit);
    } catch (error) {
      expect(error).toEqual(new Error('fetch error'));
    }
  })
});
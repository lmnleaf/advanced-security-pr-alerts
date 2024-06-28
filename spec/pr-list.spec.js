import { repoPRs } from '../src/repo-prs.js';
import { orgRepos } from '../src/org-repos.js';
import { prList } from '../src/pr-list.js';
import Moctokit from './support/moctokit.js';

describe("PR List", function() {
  let octokit;
  let getOrgReposOriginal;
  let getPRsOriginal;
  let owner = 'org';
  let repos = ['repo', 'repo1'];
  let totalDays = 30;
  let repoNames = [ 'repo', 'repo1' ];
  let prData = [
    {
      repo: 'repo',
      number: 10,
      user: 'cool',
      state: 'closed',
      draft: false,
      merged_at: '2023-04-01T12:00:00Z',
      updated_at: '2023-04-02T12:00:00Z'
    },
    {
      repo: 'repo1',
      number: 9,
      user: 'wow',
      state: 'open',
      draft: false,
      merged_at: null,
      updated_at: '2023-04-02T12:00:00Z'
    }
  ]

  beforeEach(() => {
    octokit = new Moctokit();

    getOrgReposOriginal = orgRepos.getOrgRepos;
    orgRepos.getOrgRepos = jasmine.createSpy('getOrgRepos').and.returnValue(Promise.resolve(repoNames));

    getPRsOriginal = repoPRs.getPRs;
    repoPRs.getPRs = jasmine.createSpy('getPRs').and.returnValue(Promise.resolve(prData));
  });

  afterEach(() => {
    // reset to original module function, so doesn't affect other tests
    orgRepos.getOrgRepos = getOrgReposOriginal;
    repoPRs.getPRs = getPRsOriginal;
  });


  it('gets PRs from a list of repos', async function() {
    let prs = await prList.getPRs(owner, repos, totalDays, octokit);

    expect(repoPRs.getPRs).toHaveBeenCalledWith(owner, 'repo', totalDays, octokit);
    expect(repoPRs.getPRs).toHaveBeenCalledWith(owner, 'repo1', totalDays, octokit);
    expect(orgRepos.getOrgRepos).not.toHaveBeenCalled();
    expect(prs.length).toEqual(4);
  });

  it('gets PRs from all repos in an org', async function() {
    let prs = await prList.getPRs(owner, ['all'], totalDays, octokit);

    expect(orgRepos.getOrgRepos).toHaveBeenCalledWith(owner, octokit);
    expect(repoPRs.getPRs).toHaveBeenCalledWith(owner, 'repo', totalDays, octokit);
    expect(repoPRs.getPRs).toHaveBeenCalledWith(owner, 'repo1', totalDays, octokit);
    expect(prs.length).toEqual(4);
  });

  it('handles errors', async function() {
    repoPRs.getPRs = jasmine.createSpy('getAlerts').and.returnValue(Promise.reject(new Error('fetch error')));
    let caughtError;

    try {
      await prList.getPRs(owner, repoNames, totalDays, octokit);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});

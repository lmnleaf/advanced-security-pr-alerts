class Moctokit {
    constructor() {
      this.rest = {
        issues: {
          listCommentsForRepo: this.listCommentsForRepo
        }
      };
      this.paginate = this.mockPaginate;
    }
  
    listCommentsForRepo() {
      return Promise.resolve({
        data: [
          { user: { login: 'github-advanced-security[bot]' }, pull_request_url: 'https://api.github.com/repos/org/repo/pulls/9' },
          { user: { login: 'commenter1' }, pull_request_url: 'https://api.github.com/repos/org/repo/pulls/10' }
        ]
      });
    }

    mockPaginate = jasmine.createSpy('paginate').and.callFake((method, options, callback) => {
      const comments = [
        { 
          user: { login: 'github-advanced-security[bot]' }, 
          pull_request_url: 'https://api.github.com/repos/org/repo/pulls/10', 
          created_at: new Date().toISOString() 
        }, // Comment from today
        { 
          user: { login: 'commenter1' }, 
          pull_request_url: 'https://api.github.com/repos/org/repo/pulls/9', 
          created_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 15)).toISOString() 
        }, // Comment from 15 days ago
        { 
          user: { login: 'commenter2' }, 
          pull_request_url: 'https://api.github.com/repos/org/repo/pulls/9', 
          created_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 17)).toISOString() 
        }, // Comment from 17 days ago
        { 
          user: { login: 'commenter2' }, 
          pull_request_url: 'https://api.github.com/repos/org/repo/pulls/7', 
          created_at: new Date(Date.now() - (24 * 60 * 60 * 1000 * 31)).toISOString() 
        } // Comment from 31 days ago
      ];
      const response = { data: comments };
      const done = jasmine.createSpy('done');
      callback(response, done);
      return Promise.resolve(comments.filter(comment => new Date(comment.created_at) > options.thirtyDaysAgo));
    })
  }
  
module.exports = Moctokit
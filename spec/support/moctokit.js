class Moctokit {
  constructor(mockData = []) {
    this.rest = {
      pulls: {
        list: this.listPRs,
        listReviewComments: this.listReviewComments
      },
      codeScanning: {
        getAlert: this.getAlert
      }
    };
    this.paginate = this.mockPaginate;
    this.mockData = mockData;
  }

  mockPaginate = jasmine.createSpy('paginate').and.callFake((method, options, callback) => {
    const mockData = this.mockData;
    const response = { data: mockData };
    const done = jasmine.createSpy('done');
    callback(response, done);
    return Promise.resolve(mockData);
  })

  getAlert() {
    return Promise.resolve({
      data: {
        number: 43,
        rule: {
          id: "rule-123",
          security_severity_level: "high",
          severity: "critical",
          description: "This rule detects SQL injection vulnerabilities."
        },
        state: "open",
        most_recent_instance: {
          state: "active",
          ref: "refs/heads/main",
          commit_sha: "a1b2c3d4e5f6",
          location: {
            path: "/src/database/queries.js"
          }
        },
        tool: {
          name: "CodeScanner",
          version: "1.0.0"
        },
        dismissed_at: null,
        dismissed_by: null,
        dismissed_reason: null,
        dismissed_comment: null,
        fixed_at: "2024-05-01T12:00:00Z",
        created_at: "2023-04-01T12:00:00Z",
        updated_at: "2023-04-02T12:00:00Z"
      }
    })
  }
}
  
module.exports = Moctokit
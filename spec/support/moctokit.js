class Moctokit {
  constructor(mockData = [], error = false, errorMessage = 'fetch error') {
    this.rest = {
      pulls: {
        list: this.listPRs,
        listReviewComments: this.listReviewComments
      },
      repos: {
        listForOrg: this.listForOrg,
      },
      codeScanning: {
        listAlertsForRepo: this.listAlertsForRepo,
        getAlert: this.getAlert
      }
    };
    this.paginate = this.mockPaginate;
    this.mockData = mockData;
    this.error = error;
    this.errorMessage = errorMessage;
  }

  mockPaginate = jasmine.createSpy('paginate').and.callFake((method, options, callback) => {
    const error = this.error;
    const errorMessage = this.errorMessage;
    const mockData = this.mockData;
    const response = { data: mockData };
    const done = jasmine.createSpy('done');

    if(error) {
      return Promise.reject(new Error(errorMessage));
    } else {
      callback(response, done);
      return Promise.resolve(mockData);
    }
  });

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
        fixed_at: null,
        created_at: "2023-04-01T12:00:00Z",
        updated_at: "2023-04-02T12:00:00Z"
      }
    })
  }
}
  
export default Moctokit;

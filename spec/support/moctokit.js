class Moctokit {
  constructor(mockData = []) {
    this.rest = {
      pulls: {
        list: this.listPRs,
        listReviewComments: this.listReviewComments
      },
      repos: {
        listForOrg: this.listForOrg,
      },
      codeScanning: {
        listAlertsForRepo: this.listAlertsForRepo
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
  });
}
  
export default Moctokit;

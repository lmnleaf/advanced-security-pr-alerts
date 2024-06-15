class Moctokit {
    constructor(mockData) {
      this.rest = {
        issues: {
          listCommentsForRepo: this.listCommentsForRepo
        },
        pulls: {
          list: this.listPRs
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
      return Promise.resolve(mockData.filter(someData => new Date(someData.created_at) > options.thirtyDaysAgo));
    })
  }
  
module.exports = Moctokit
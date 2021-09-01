const {getBranchName} = require('../git-commands');

describe('git commands', () => {
  beforeEach(() => {
    delete process.env['GITHUB_HEAD_REF'];
    delete process.env['GITHUB_REF'];
  });

  test('should return git branch name when there is PR open for that branch', () => {
    // setup
    process.env['GITHUB_HEAD_REF'] = 'feature/TICKET-1234-my-branch';
    process.env['GITHUB_REF'] = 'refs/pull/123/merge';

    // expect
    expect(getBranchName()).toBe('feature/TICKET-1234-my-branch');
  });

  test('should return git branch name when there is no PR associated with that branch', () => {
    // setup
    process.env['GITHUB_REF'] = 'refs/heads/feature/TICKET-1234-my-branch';

    // expect
    expect(getBranchName()).toBe('feature/TICKET-1234-my-branch');
  });
});

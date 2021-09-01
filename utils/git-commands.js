module.exports = {
  getBranchName: () => {
    return process.env['GITHUB_HEAD_REF'] || process.env['GITHUB_REF'].slice('refs/heads/'.length);
  },
};

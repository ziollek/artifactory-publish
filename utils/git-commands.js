module.exports = {
  getBranchName: () => {
    return process.env['GITHUB_BASE_REF'] || process.env['GITHUB_REF'].slice('refs/heads/'.length);
  },
};

const path = require('path');
const core = require('@actions/core');
const { reportAction } = require('@gh-stats/reporter');
const assert = require('assert').strict;
const action = require('./action');
const { getBranchName } = require('../utils/git-commands');

try {
  const host = core.getInput('host');
  const username = core.getInput('username');
  const email = core.getInput('email');
  const password = core.getInput('password');

  assert(host, '`host` is not provided!');
  assert(email || username, '`email` is not provided!');
  assert(password, '`password` is not provided!');
  
  const packageJson =  require(path.join(process.env['GITHUB_WORKSPACE'], 'package.json'));

  const info = action({
    packageVersion: packageJson.version,
    branchName: getBranchName(),
    currentDate: new Date(),
    host: core.getInput('host'),
    username: core.getInput('username'),
    email: core.getInput('email'),
    password: core.getInput('password'),
  });

  console.log('');
  console.log(`* Published ${packageJson.name}`);
  console.log(`*    version: ${info.version}`);
  console.log(`*    tag:     ${info.tag}`);
} catch (e) {
  core.setFailed(e);
}

reportAction();

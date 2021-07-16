const { execSync: exec } = require('child_process');
const core = require('@actions/core');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');

try {
  exec(`echo "registry=https://${host}/artifactory/api/npm/group-npm" > .npmrc`);
  exec('export npm_config_always_auth=true');
  exec(`export npm_config__auth=${password}`);
  exec(`export npm_config_email=${username}`);
  exec('npm publish');
} catch (e) {
  core.setFailed(e);
}
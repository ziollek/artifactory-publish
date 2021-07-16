const core = require('@actions/core');
const maven = require('./packaging/maven');
const docker = require('./packaging/docker');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const group = core.getInput('group');
const buildDir = core.getInput('buildDir');
const version = core.getInput('version');
const tychoPath = core.getInput('tycho');
const type = core.getInput('type');

process.on('unhandledRejection', up => {
  core.setFailed(`Action failed ${up}`);
});

switch (type) {
  case 'maven': {
    const currentBranch = process.env['GITHUB_HEAD_REF'] || process.env['GITHUB_REF'].split('/').pop();
    maven(host, username, password, name, group, buildDir, version, tychoPath, currentBranch);
    break;
  }
  case 'docker': {
    docker(host, username, password, name, group, version);
    break;
  }
  default: {
    core.setFailed('unknown artifact type');
  }
}
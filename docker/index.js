const { execSync: exec } = require('child_process');
const core = require('@actions/core');
const uuid = require('uuid');
const { publishProvisioning } = require('../utils/provisioning');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const path = core.getInput('path');
const version = core.getInput('version');
const dockerfile = core.getInput('dockerfile') || 'Dockerfile';
const context = core.getInput('context') || '.';
const tychoPath = core.getInput('tycho');

const temp = uuid.v4();
const imageTag = `${host}/${path}/${name}`;

const currentBranch = process.env['GITHUB_HEAD_REF'] || process.env['GITHUB_REF'].split('/').pop();
core.info(`current branch: ${currentBranch}`);
const isSnapshot = !['master', 'main'].includes(currentBranch);
if (isSnapshot) core.info('this is a snapshot release');

try {
  exec(`docker login -u ${username} -p ${password} ${host}`);
  core.info(`logged into ${host}`);
  exec(`docker build -f ${dockerfile} -t ${imageTag}:${temp} ${context}`);
  core.info('docker build successfully');
  exec(`docker tag ${imageTag}:${temp} ${imageTag}:${version}`);
  core.info(`docker tag created ${imageTag}:${temp} ${imageTag}:${version}`);
  exec(`docker push ${imageTag}:${version}`);
  core.info(`docker push finished ${imageTag}:${temp} ${imageTag}:${version}`);
} catch (e) {
  core.setFailed(e);
}

publishProvisioning(username, password, host, path, name, version, currentBranch, isSnapshot, tychoPath);

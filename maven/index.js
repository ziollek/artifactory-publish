const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const core = require('@actions/core');
const { reportAction } = require('@gh-stats/reporter');
const { compressDirectory } = require('../utils/compress');
const { deployArtifactUrl } = require('../utils/artifactory');
const { publishProvisioning } = require('../utils/provisioning');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const group = core.getInput('group');
const buildDir = core.getInput('buildDir');
const version = core.getInput('version');
const tychoPath = core.getInput('tycho');
const provisioningPath = core.getInput('provisioning');
const distributionsDir = core.getInput('distributionsDir');
const currentBranch = process.env['GITHUB_HEAD_REF'] || process.env['GITHUB_REF'].split('/').pop();

reportAction();

core.info(`current branch: ${currentBranch}`);
const isSnapshot = !['master', 'main'].includes(currentBranch);
if (isSnapshot) core.info('this is a snapshot release');

if (buildDir) {
  publishBuildDir();
} else {
  publishDistributions();
}

publishProvisioning(username, password, host, group, name, version, currentBranch, isSnapshot, tychoPath, provisioningPath);

const target = deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot);

function publishDistributions() {
  fs.promises.readdir(distributionsDir, { withFileTypes: true })
    .then(files => files.filter(file => !file.isDirectory()).filter(file => file.name.endsWith('.zip')))
    .then(data => {
      data.map(file => path.join(distributionsDir, file.name))
        .map(zipFile => fetch(target.toString(), {
          method: 'PUT', body: fs.readFileSync(zipFile)
        }).then(response => response.status));
    })
    .then((status) => {
      core.info(`[deploy package] artifactory response: ${status}`);
      if (status >= 300) {
        throw new Error('main package upload failed');
      }
    })
    .then(() => {
      const url = deployArtifactUrl(null, null, host, group, name, version, currentBranch, isSnapshot);
      core.info(`${url} uploaded.`);
      core.setOutput('url', url);
    })
    .catch(reason => core.setFailed(reason));
}

function publishBuildDir() {
  compressDirectory(buildDir)
    .then(data => fetch(target.toString(), { method: 'PUT', body: data }).then(response => response.status))
    .then((status) => {
      core.info(`[deploy package] artifactory response: ${status}`);
      if (status >= 300) {
        throw new Error('main package upload failed');
      }
    })
    .then(() => {
      const url = deployArtifactUrl(null, null, host, group, name, version, currentBranch, isSnapshot);
      core.info(`${url} uploaded.`);
      core.setOutput('url', url);
    })
    .catch(reason => core.setFailed(reason));
}

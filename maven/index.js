const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const core = require('@actions/core');
const { compressDirectory, compressFiles } = require('./compress');
const { deployArtifactUrl, provisioningArtifactUrl } = require('./artifactory');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const group = core.getInput('group');
const buildDir = core.getInput('buildDir');
const version = core.getInput('version');
const tychoPath = core.getInput('tycho');
const distributionsDir = core.getInput('distributionsDir');

const currentBranch = process.env['GITHUB_HEAD_REF'] || process.env['GITHUB_REF'].split('/').pop();

core.info(`current branch: ${currentBranch}`);
const isSnapshot = !['master', 'main'].includes(currentBranch);
if (isSnapshot) core.info('this is a snapshot release');

if(buildDir){
  publishBuildDir();
}else {
  publishDistributions();
}

function publishDistributions() {
  const target = deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot);
  fsPromises.readdir(distributionsDir, {withFileTypes:true})
  .then(files => files
  .filter(file => !file.isDirectory())
  .filter(file => file.name.endsWith('.zip'))
  )
  .then(data => {
    data.map(file => path.join(distributionsDir, file.name))
    .map(zipFile => fetch(target.toString(), {method: 'PUT', body: fs.readFileSync(zipFile)
    }).then(response => response.status));
  })
  .then((status) => {
    core.info(`[deploy package] artifactory response: ${status}`);
    checkStatus(status);
  })
  .then(() => {
    const url = deployArtifactUrl('', '', host, group, name, version, currentBranch, isSnapshot);
    url.username = null;
    url.password = null;
    core.info(`${url} uploaded.`);
    core.setOutput('url', url);
  })
  .catch(reason => core.setFailed(reason));
}

function publishBuildDir() {
  const target = deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot);
  compressDirectory(buildDir)
  .then(data => fetch(target.toString(), {method: 'PUT', body: data}).then(response => response.status))
  .then((status) => {
    core.info(`[deploy package] artifactory response: ${status}`);
    checkStatus(status);
  })
  .then(() => {
    const url = deployArtifactUrl('', '', host, group, name, version, currentBranch, isSnapshot);
    url.username = null;
    url.password = null;
    core.info(`${url} uploaded.`);
    core.setOutput('url', url);
  })
  .catch(reason => core.setFailed(reason));
}

if (fs.existsSync(tychoPath)) {
  fs.writeFileSync('dependencies.yml', 'datasources:\nservices:\n');
  fs.writeFileSync('environment-variables.yml', 'envs:\n');
  fs.writeFileSync('deployment.yml', fs.readFileSync(tychoPath, 'utf8'));
  const target = provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot).toString();
  compressFiles(['deployment.yml', 'environment-variables.yml', 'dependencies.yml'])
    .then(data => fetch(target, { method: 'PUT', body: data }).then(response => response.status))
    .then((status) => {
      core.info(`[provisioning package] artifactory response: ${status}`);
      checkStatus(status);
    })
    .then(() => {
      const url = provisioningArtifactUrl('', '', host, group, name, version, currentBranch, isSnapshot);
      url.username = null;
      url.password = null;
      core.info(`${provisioningArtifactUrl} uploaded.`);
      core.setOutput('url', url);
    })
    .catch(reason => core.setFailed(reason));
}

function checkStatus(status) {
  if (status >= 300) {
    throw new Error('provisioning package upload failed');
  }
}
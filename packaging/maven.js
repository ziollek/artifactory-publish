const fs = require('fs');
const core = require('@actions/core');
const fetch = require('node-fetch');
const { compressDirectory, compressFiles } = require('../util/compress');
const { deployArtifactUrl, provisioningArtifactUrl } = require('../util/artifactory');

module.exports = function (host, username, password, name, group, buildDir, version, tychoPath, currentBranch) {

  core.info(`current branch: ${currentBranch}`);
  const isSnapshot = !['master', 'main'].includes(currentBranch);
  if (isSnapshot) core.info('this is a snapshot release');

  compressDirectory(buildDir)
    .then(data => fetch(deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot).toString(), {
      method: 'PUT',
      body: data
    }).then(response => response.status))
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

  if (fs.existsSync(tychoPath)) {
    fs.writeFileSync('dependencies.yml', 'datasources:\nservices:\n');
    fs.writeFileSync('environment-variables.yml', 'envs:\n');
    fs.writeFileSync('deployment.yml', fs.readFileSync(tychoPath, 'utf8'));
    compressFiles(['deployment.yml', 'environment-variables.yml', 'dependencies.yml'])
      .then(data => fetch(provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot).toString(), {
        method: 'PUT',
        body: data
      }).then(response => response.status))
      .then((status) => {
        core.info(`[provisioning package] artifactory response: ${status}`);
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
};

function checkStatus(status) {
  if (status >= 300) {
    throw new Error('provisioning package upload failed');
  }
}
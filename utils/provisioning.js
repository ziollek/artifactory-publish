const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const fetch = require('node-fetch');

const { compressDirectory } = require('./compress');
const { provisioningArtifactUrl } = require('./artifactory');

module.exports = {
  publishProvisioning: (username, password, host, group, name, version, currentBranch, isSnapshot, tychoPath) => {
    const provisioningDir = 'provisioning';
    if (!fs.existsSync(provisioningDir)) {
      fs.mkdirSync(provisioningDir);
      fs.writeFileSync(path.join(provisioningDir, 'dependencies.yml'), 'datasources:\nservices:\n');
      fs.writeFileSync(path.join(provisioningDir, 'environment-variables.yml'), 'envs:\n');
    }
    if (fs.existsSync(tychoPath)) {
      fs.writeFileSync(path.join(provisioningDir, 'deployment.yml'), fs.readFileSync(tychoPath, 'utf8'));
    }
    const provisioningTargetUrl = provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot).toString();
    compressDirectory(provisioningDir)
      .then(data => fetch(provisioningTargetUrl.toString(), { method: 'PUT', body: data }).then(response => response.status))
      .then((status) => {
        core.info(`[provisioning package] artifactory response: ${status}`);
        if (status >= 300) {
          throw new Error('provisioning package upload failed');
        }
      })
      .then(() => {
        provisioningTargetUrl.username = null;
        provisioningTargetUrl.password = null;
        core.info(`${provisioningTargetUrl} uploaded.`);
        core.setOutput('url', provisioningTargetUrl);
      })
      .catch(reason => core.setFailed(reason));
  }
};

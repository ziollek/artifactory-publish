const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const fetch = require('node-fetch');

const { compressDirectory } = require('./compress');
const { provisioningArtifactUrl } = require('./artifactory');

module.exports = {
  publishProvisioning: (username, password, host, group, name, version, currentBranch, isSnapshot, tychoPath, provisioningPath) => {
    if (!fs.existsSync(provisioningPath)) {
      fs.mkdirSync(provisioningPath);
      fs.writeFileSync(path.join(provisioningPath, 'dependencies.yml'), 'datasources:\nservices:\n');
      fs.writeFileSync(path.join(provisioningPath, 'environment-variables.yml'), 'envs:\n');
      fs.writeFileSync(path.join(provisioningPath, 'deployment.yml'), fs.readFileSync(tychoPath, 'utf8'));
    } else {
      if (!fs.existsSync(path.join(provisioningPath, 'deployment.yml'))) {
        fs.writeFileSync(path.join(provisioningPath, 'deployment.yml'), fs.readFileSync(tychoPath, 'utf8'));
      }
    }
    const provisioningTargetUrl = provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot).toString();
    compressDirectory(provisioningPath)
      .then(data => fetch(provisioningTargetUrl.toString(), { method: 'PUT', body: data }).then(response => response.status))
      .then((status) => {
        core.info(`[provisioning package] artifactory response: ${status}`);
        if (status >= 300) {
          throw new Error('provisioning package upload failed');
        }
      })
      .then(() => {
        const url = provisioningArtifactUrl(null, null, host, group, name, version, currentBranch, isSnapshot);
        core.info(`${url} uploaded.`);
        core.setOutput('url', url);
      })
      .catch(reason => core.setFailed(reason));
  }
};

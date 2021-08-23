const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const fetch = require('node-fetch');
const { compressDirectory } = require('./compress');

module.exports = {
  /**
   * Upload provisioning artifact
   *
   * @param {String} tychoPath
   * @param {String} provisioningPath
   * @param {URL} provisioningTargetUrl
   * @return {Promise<URL>}
   */
  publishProvisioning: (tychoPath, provisioningPath, provisioningTargetUrl) => {
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
    return compressDirectory(provisioningPath)
      .then(data => fetch(provisioningTargetUrl.toString(), { method: 'PUT', body: data }))
      .then(response => response.status)
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
        return provisioningTargetUrl;
      });
  }
};

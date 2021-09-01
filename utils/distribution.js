const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const core = require('@actions/core');
const { compressDirectory } = require('../utils/compress');

module.exports = {
  /**
   * upload distZip
   * @param {String} distributionsDir
   * @param {URL} deployArtifactUrl
   * @return {Promise<void>}
   */
  publishDistributions(distributionsDir, deployArtifactUrl) {
    return fs.promises.readdir(distributionsDir, { withFileTypes: true })
      .then(files => files.filter(file => !file.isDirectory()))
      .then(files => files.find(file => file.name.endsWith('.zip')))
      .then(zipFile => path.join(distributionsDir, zipFile.name))
      .then(zipFilePath => fs.readFileSync(zipFilePath))
      .then(data => fetch(deployArtifactUrl.toString(), { method: 'PUT', body: data }))
      .then(response => response.status)
      .then(status => {
        core.info(`[deploy package] artifactory response: ${status}`);
        if (status >= 300) {
          throw new Error('main package upload failed');
        }
      })
      .then(() => {
        deployArtifactUrl.username = null;
        deployArtifactUrl.password = null;
        core.info(`${deployArtifactUrl} uploaded.`);
      });
  },

  /**
   * upload directory
   * @param {String} buildDir
   * @param {Boolean} includeDotFiles
   * @param {URL} deployArtifactUrl
   * @return {Promise<void>}
   */
  publishBuildDir(buildDir, includeDotFiles, deployArtifactUrl) {
    return compressDirectory(buildDir, includeDotFiles)
      .then(data => fetch(deployArtifactUrl.toString(), { method: 'PUT', body: data }))
      .then(response => response.status)
      .then((status) => {
        core.info(`[deploy package] artifactory response: ${status}`);
        if (status >= 300) {
          throw new Error('main package upload failed');
        }
      })
      .then(() => {
        deployArtifactUrl.username = null;
        deployArtifactUrl.password = null;
        core.info(`${deployArtifactUrl} uploaded.`);
      });
  }
};
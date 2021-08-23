const core = require('@actions/core');
const { reportAction } = require('@gh-stats/reporter');
const { deployArtifactUrl, provisioningArtifactUrl } = require('../utils/artifactory');
const { publishProvisioning } = require('../utils/provisioning');
const { publishBuildDir, publishDistributions } = require('../utils/distribution');

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
  publishBuildDir(buildDir, deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
    .then(deployTargetUrl => core.setOutput('deploy', deployTargetUrl))
    .catch((e) => core.setFailed(e));
} else {
  publishDistributions(distributionsDir, deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
    .then(deployTargetUrls => deployTargetUrls.forEach((url, i) => core.setOutput(`deploy.${i}`, url)))
    .catch((e) => core.setFailed(e));
}

publishProvisioning(tychoPath, provisioningPath, provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
  .then(provisioningTargetUrl => core.setOutput('provisioning', provisioningTargetUrl))
  .catch((e) => core.setFailed(e));

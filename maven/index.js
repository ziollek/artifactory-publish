const core = require('@actions/core');
const { reportAction } = require('@gh-stats/reporter');
const { deployArtifactUrl, provisioningArtifactUrl } = require('../utils/artifactory');
const { publishProvisioning } = require('../utils/provisioning');
const { publishBuildDir, publishDistributions } = require('../utils/distribution');
const { getBranchName } = require('../utils/git-commands');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const group = core.getInput('group');
const buildDir = core.getInput('buildDir');
const includeDotFiles = core.getInput('includeDotFiles');
const version = core.getInput('version');
const tychoPath = core.getInput('tycho');
const provisioningPath = core.getInput('provisioning');
const distributionsDir = core.getInput('distributionsDir');
const currentBranch = getBranchName();

reportAction();

core.info(`current branch: ${currentBranch}`);
const isSnapshot = !['master', 'main'].includes(currentBranch);
if (isSnapshot) core.info('this is a snapshot release');

if (buildDir) {
  publishBuildDir(buildDir, !!includeDotFiles, deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
    .catch((e) => core.setFailed(e));
} else {
  publishDistributions(distributionsDir, deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
    .catch((e) => core.setFailed(e));
}

publishProvisioning(tychoPath, provisioningPath, provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
  .catch((e) => core.setFailed(e));

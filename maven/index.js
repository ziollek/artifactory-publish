const core = require('@actions/core');
const { reportAction } = require('@gh-stats/reporter');
const { deployArtifactUrl, provisioningArtifactUrl } = require('../utils/artifactory');
const { publishProvisioning } = require('../utils/provisioning');
const { publishBuildDir, publishDistributions } = require('../utils/distribution');
const { getBranchName } = require('../utils/git-commands');
const semver = require('semver');
const { execSync: exec } = require('child_process');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const group = core.getInput('group');
const buildDir = core.getInput('buildDir');
const includeDotFiles = core.getBooleanInput('includeDotFiles');
const version = core.getInput('version');
const tychoPath = core.getInput('tycho');
const provisioningPath = core.getInput('provisioning');
const distributionsDir = core.getInput('distributionsDir');
const releaseTagPrefix = core.getInput('releaseTagPrefix');
const currentBranch = getBranchName();

reportAction();

const currentTagNames = exec('git tag --points-at=HEAD').toString().split('\n');
core.info(`current branch: ${currentBranch}`);
core.info(`current tag names: ${currentTagNames.join(',')}`);
core.info(`releaseTagPrefix: ${releaseTagPrefix}`);

const isSnapshot = !['master', 'main'].includes(currentBranch) && !validSemVer(currentBranch) && !currentTagNames.some(tag => validSemVer(tag));
if (isSnapshot) core.info('this is a snapshot release');

publishProvisioning(tychoPath, provisioningPath, provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
  .catch((e) => core.setFailed(e));

if (buildDir) {
  publishBuildDir(buildDir, includeDotFiles, deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
    .catch((e) => core.setFailed(e));
} else {
  publishDistributions(distributionsDir, deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot))
    .catch((e) => core.setFailed(e));
}

function stripReleaseTagPrefix(tag) {
  return tag.replace(releaseTagPrefix, '');
}

function validSemVer(tag) {
  return semver.valid(stripReleaseTagPrefix(tag));
}


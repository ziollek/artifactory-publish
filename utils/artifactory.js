module.exports = {
  deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, snapshotSuffix = '-SNAPSHOT') {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, '-deploy.zip', snapshotSuffix);
  },

  provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, snapshotSuffix = '-SNAPSHOT') {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, '-provisioning.zip', snapshotSuffix);
  },

  artifactVersion(version, currentBranch, isSnapshot, snapshotSuffix = '-SNAPSHOT') {
    return artifactVersion(version, currentBranch, isSnapshot, snapshotSuffix);
  }
};

/**
 * Returns artifactory URL
 *
 * @param {String} username
 * @param {String} password
 * @param {String} host
 * @param {String} group
 * @param {String} name
 * @param {String} version
 * @param {String} currentBranch
 * @param {boolean} isSnapshot
 * @param {String} fileNameSuffix
 * @param {String} snapshotSuffix
 * @return {URL}
 */
function artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, fileNameSuffix, snapshotSuffix) {
  const targetPath = group.replace(/\./g, '/');
  const targetVersion = artifactVersion(version, currentBranch, isSnapshot, snapshotSuffix);
  const targetFileName = artifactFileName(name, version, currentBranch, isSnapshot, fileNameSuffix);
  const credentials = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
  return new URL(
    `/artifactory/allegro-${isSnapshot ? 'snapshots' : 'releases'}-local/${targetPath}/${name}/${targetVersion}/${targetFileName}`,
    `https://${credentials}${host}`
  );
}

function artifactVersion(version, currentBranch, isSnapshot, snapshotSuffix = '-SNAPSHOT') {
  const branchPart = isSnapshot ? `-${slugify(currentBranch)}` : '';
  const snapshotPart = isSnapshot ? snapshotSuffix : '';
  return `${version}${branchPart}${snapshotPart}`;
}

function artifactFileName(name, version, currentBranch, isSnapshot, fileNameSuffix) {
  const branchPart = isSnapshot ? `-${slugify(currentBranch)}` : '';
  const timestampPart = isSnapshot ? `-${getTimestamp()}` : '';
  return `${name}-${version}${branchPart}${timestampPart}${fileNameSuffix}`;
}

function getTimestamp() {
  return new Date().toISOString()
    .replace(/\..+/, '')
    .replace('T', '.')
    .replace(/:/g, '')
    .replace(/-/g, '') + '-1';
}

function slugify(input) {
  return input.toString()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

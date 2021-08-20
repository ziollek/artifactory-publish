module.exports = {
  deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot) {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, '-deploy.zip');
  },

  provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot) {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, '-provisioning.zip');
  }
};

function artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, fileNameSuffix = '.zip') {
  const snapshotSuffix = isSnapshot ? '-SNAPSHOT' : '';
  const snapshotFilenameSuffix = isSnapshot ? `-${getTimestamp()}` : '';
  const branchSuffix = isSnapshot ? `-${slugify(currentBranch)}` : '';
  const targetPath = group.replace(/\./g, '/');
  const targetVersion = `${version}${branchSuffix}`;
  const targetFileName = `${name}-${targetVersion}${snapshotFilenameSuffix}${fileNameSuffix}`;
  const credentials = username && password ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@` : '';
  return new URL(
    `/artifactory/allegro-${isSnapshot ? 'snapshots' : 'releases'}-local/${targetPath}/${name}/${targetVersion}${snapshotSuffix}/${targetFileName}`,
    `https://${credentials}${host}`
  );
}

function getTimestamp() {
  return new Date().toISOString()
    .replace(/\..+/, '')
    .replace('T', '.')
    .replace(/:/g, '')
    .replace(/-/g, '') + '-1';
}

function slugify(input) {
  return input.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

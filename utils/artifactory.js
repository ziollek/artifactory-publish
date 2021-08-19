module.exports = {
  deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, timestampFunction = getTimestamp) {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, timestampFunction, '-deploy.zip');
  },

  provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, timestampFunction = getTimestamp) {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, timestampFunction, '-provisioning.zip');
  }
};

function getTimestamp() {
  return new Date().toISOString().replace(/\..+/, '').replace('T', '.').replace(/:/g, '').replace(/-/g, '') + '-1';
}

function artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, timestampFunction, fileNameSuffix = '.zip') {
  const snapshotSuffix = isSnapshot ? '-SNAPSHOT' : '';
  const snapshotFilenameSuffix = isSnapshot ? `-${timestampFunction()}` : '';
  const brachSuffix = isSnapshot ? `-${slugify(currentBranch)}` : '';
  const targetPath = group.replace(/\./g, '/');
  const targetVersion = `${version}${brachSuffix}`;
  const targetFileName = `${name}-${targetVersion}${snapshotFilenameSuffix}${fileNameSuffix}`;
  return new URL(
    `/artifactory/allegro-${isSnapshot ? 'snapshots' : 'releases'}-local/${targetPath}/${name}/${targetVersion}${snapshotSuffix}/${targetFileName}`,
    `https://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}`
  );
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

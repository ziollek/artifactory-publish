const { getVersionSuffix } = require('./tag');

module.exports = {
  deployArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot) {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, '-deploy.zip');
  },

  provisioningArtifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot) {
    return artifactUrl(username, password, host, group, name, version, currentBranch, isSnapshot, '-provisioning.zip');
  },
};

function artifactUrl(
  username,
  password,
  host,
  group,
  name,
  version,
  currentBranch,
  isSnapshot,
  fileNameSuffix = '.zip'
) {
  const targetVersion = `${version}${getVersionSuffix(currentBranch, isSnapshot)}-SNAPSHOT`;
  const targetPath = group.replace(/\./g, '/');
  const targetFileName = `${name}-${targetVersion}${fileNameSuffix}`;
  return new URL(
    `/artifactory/allegro-${
      isSnapshot ? 'snapshots' : 'releases'
    }-local/${targetPath}/${name}/${targetVersion}/${targetFileName}`,
    `https://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}`
  );
}

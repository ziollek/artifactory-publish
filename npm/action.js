const { execSync: exec } = require('child_process');

function formatTimestamp(date) {
  return date.toISOString()
    .replace(/-/g, '')
    .replace(/:/g, '')
    .replace('T', '')
    .split('.')[0];
}

module.exports = function action({ packageVersion, branchName, currentDate, host, username, email, password }) {
  const timestamp = formatTimestamp(currentDate);

  process.env['npm_config_registry'] = `https://${host}/artifactory/api/npm/group-npm`;
  process.env['npm_config_always_auth'] = 'true';
  process.env['npm_config__auth'] = password;
  process.env['npm_config_email'] = email || username;

  if (['main', 'master'].includes(branchName)) {
    exec('npm publish --tag latest');

    return { version: packageVersion, tag: 'latest' };
  } else {
    const normalizedBranchName = branchName.replace(/\//g, '-');
    const workingVersion = `${packageVersion}-${normalizedBranchName}.${timestamp}`;
    
    exec(`npm --no-git-tag-version version ${workingVersion}`);
    exec(`npm publish --tag ${normalizedBranchName}`);

    return { version: workingVersion, tag: normalizedBranchName };
  }
};

const fs = require('fs');
const { execSync: exec } = require('child_process');
const core = require('@actions/core');

module.exports = function (host, username, password, name, group, version) {
  exec(`curl -u ${username}:${password} -s https://${host}/v2/auth > .dockercfg`);
  const fileContents = String(fs.readFileSync('.dockercfg', 'utf8'));
  fs.writeFileSync('.dockercfg', fileContents.replace(/https:\/\/localhost:8081/gm, `https://${host}`));
  const stdout = exec(`docker --config .dockercfg push ${host}/${group}/${name}:${version}`);
  core.info(String(stdout).trim());
};
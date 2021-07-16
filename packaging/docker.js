const { execSync: exec } = require('child_process');
const core = require('@actions/core');

module.exports = function (host, username, password, name, group, version) {
  exec(`curl -u ${username}:${password} -s https://${host}/v2/auth > .dockercfg`);
  const command = `
    IMAGEID=$(uuidgen)
    IMAGETAG="${host}/${group}/${name}:${version}"
    docker build -t $IMAGETAG:$IMAGEID .
    docker tag $IMAGETAG:$IMAGEID $IMAGETAG:${version}
    echo '{"auths": ' >> config.json
    curl -u ${username}:${password} -s "${host}/v2/auth" >> config.json
    echo " }" >> config.json
    sed -i 's%localhost:8081%${host}%' config.json
    docker --config=./ push $IMAGETAG:${version}
  `.replace(/\n/g, '\\\n');
  const stdout = exec(command);
  core.info(String(stdout).trim());
};
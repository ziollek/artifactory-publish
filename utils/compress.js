const util = require('util');
const fs = require('fs');
const uuid = require('uuid');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  compressDirectory: async (source) => {
    const target = `${uuid.v4()}.zip`;
    const { error } = await exec(`cd ${source} && zip --quiet --symlinks --recurse-paths "$OLDPWD/${target}" * --exclude "$OLDPWD/${target} && cd $OLDPWD"`);
    if (error) throw new Error(`zip command error: ${error}`);
    return fs.readFileSync(target);
  },
  compressFiles: async (files) => {
    const target = `${uuid.v4()}.zip`;
    const { error } = await exec(`zip --quiet ${target} ${files.join(' ')}`);
    if (error) throw new Error(`zip command error: ${error}`);
    return fs.readFileSync(target);
  }
};

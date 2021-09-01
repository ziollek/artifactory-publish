const util = require('util');
const fs = require('fs');
const uuid = require('uuid');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  /**
   * compress directory
   * @param {String} source
   * @param {Boolean} includeDotFiles
   * @return {Promise<Buffer>}
   */
  compressDirectory: async (source, includeDotFiles) => {
    const target = `${uuid.v4()}.zip`;
    const { error } = await exec(`cd ${source} && zip --quiet --symlinks --recurse-paths "$OLDPWD/${target}" ${includeDotFiles ? '.' : '*'} --exclude "$OLDPWD/${target} && cd $OLDPWD"`);
    if (error) throw new Error(`zip command error: ${error}`);
    const buffer = fs.readFileSync(target);
    fs.unlinkSync(target);
    return buffer;
  }
};

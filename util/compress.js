const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  compressDirectory: async (source) => {
    const target = `/tmp/bundledApp.zip`; //TODO: poprawna nazwa bundle'a

    const { error } = await exec(`cd ${source} && zip --quiet --symlinks --recurse-paths "${target}" * --exclude "${target}"`);
    if (error) throw new Error(`zip command error: ${error}`);
    return fs.readFileSync(target);
  },
  compressFiles: async (files) => {
    const target = `${getRandomFileName()}.zip`;
    const { error } = await exec(`zip --quiet ${target} ${files.join(' ')}`);
    if (error) throw new Error(`zip command error: ${error}`);
    return fs.readFileSync(target);
  }
};

function getRandomFileName() {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const random = ('' + Math.random()).substring(2, 8);
  return timestamp + random;
}
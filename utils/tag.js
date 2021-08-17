module.exports = {
  getVersionSuffix,
  slugify,
};

function getVersionSuffix(currentBranch, isSnapshot) {
  return isSnapshot ? `-${slugify(currentBranch)}` : '';
}

function slugify(input) {
  return input
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\/+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

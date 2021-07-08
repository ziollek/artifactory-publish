const core = require('@actions/core');
const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');

const host = core.getInput('host');
const username = core.getInput('username');
const password = core.getInput('password');
const name = core.getInput('name');
const group = core.getInput('group');
const buildDir = core.getInput('buildDir');
const version = core.getInput('version');

const targetPath = group.replace(/\./g, '/');
const isSnapshot = version.endsWith('-SNAPSHOT');

const deployPackage = version + '-deploy.zip';
exec(`zip --quiet --symlinks --recurse-paths "${deployPackage}" ${buildDir} --exclude "${deployPackage}"`, (error) => {
    if (error) {
        console.error(`exec error: ${error}`);
        process.exit(1);
    }

    const targetVersion = isSnapshot ? version : version.substring(version.lastIndexOf('-') + 1, version.length);
    const artifactoryUrl = `https://${username}:${password}@${host}/artifactory/allegro-${isSnapshot ? 'snapshots' : 'releases'}-local/${targetPath}/${name}/${targetVersion}/${deployPackage}`;
    const data = fs.readFileSync(deployPackage);
    fetch(artifactoryUrl, { method: 'PUT', body: data })
        .then(response => console.log(`${deployPackage} uploaded! Artifactory response: ${response.status}`))
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
});




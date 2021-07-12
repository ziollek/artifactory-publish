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
const tychoPath = core.getInput('tycho');

const targetPath = group.replace(/\./g, '/');
const isSnapshot = version.endsWith('-SNAPSHOT');

const deployPackage = name + "-" + version + '-deploy.zip';// : version + '-deploy.zip';
exec(`zip --quiet --symlinks --recurse-paths "${deployPackage}" ${buildDir} --exclude "${deployPackage}"`, (error) => {
    console.log(`package ${deployPackage}`);
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
    core.setOutput('url', `https://${host}/artifactory/allegro-${isSnapshot ? 'snapshots' : 'releases'}-local/${targetPath}/${name}/${targetVersion}/${deployPackage}`);
});


if (fs.existsSync(tychoPath)) {
    const provisioningPackage = version + '-provisioning.zip';

    fs.writeFileSync('dependencies.yml', `datasources:\nservices:\n`);
    fs.writeFileSync('environment-variables.yml', `envs:\n`);
    fs.writeFileSync('deployment.yml', fs.readFileSync(tychoPath, 'utf8'));

    exec(`zip --quiet ${provisioningPackage} dependencies.yml environment-variables.yml deployment.yml`, (error) => {
        if (error) {
            console.error(`exec error: ${error}`);
            process.exit(1);
        }
        const targetVersion = isSnapshot ? version : version.substring(version.lastIndexOf('-') + 1, version.length);
        const artifactoryUrl = `https://${username}:${password}@${host}/artifactory/allegro-${isSnapshot ? 'snapshots' : 'releases'}-local/${targetPath}/${name}/${targetVersion}/${provisioningPackage}`;
        const data = fs.readFileSync(provisioningPackage);
        fetch(artifactoryUrl, { method: 'PUT', body: data })
            .then(response => console.log(`${provisioningPackage} uploaded! Artifactory response: ${response.status}`))
            .catch(err => {
                console.error(err);
                process.exit(1);
            });
    });
}

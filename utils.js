const { exec } = require('child_process');
const process = require('process');

function getBranch() {
    const branchRef = process.env.GITHUB_REF;
    console.log(`La ruta de la rama es: ${branchRef}`);
}

function getPullRequestNumber() {
    const prNumber = process.env.PR_NUMBER;
    console.log(`Número de PR: ${prNumber}`);
}

function transformCommitRawToObject(inputObject) {
    const outputObject = {};
    for (const item of inputObject) {
        outputObject[item.type] = item.value;
    }
    return outputObject;
}


function bumpVersion(currentVersion, bumpType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    if (bumpType === 'major') {
        return `${major + 1}.0.0`;
    } else if (bumpType === 'minor') {
        return `${major}.${minor + 1}.0`;
    }
}

function execCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}


module.exports = { execCommand, bumpVersion, transformCommitRawToObject ,getPullRequestNumber, getBranch}
const { exec } = require('child_process');
const process = require('process');

const { parser } = require('@conventional-commits/parser');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

function getBranch() {
    const branchRef = process.env.GITHUB_REF;
    console.log(`La ruta de la rama es: ${branchRef}`);
}
// Just in case commits provide from git log
function organizeAndFilterCommits(rawCommits) {
    const commits = rawCommits.split('\n')
        .filter(Boolean)  // Remove empty lines
        .map((commit,index) => {
            try {
                if (index < 5)
                    return parser(commit);
            } catch (error) {
                // Handle parsing errors (commits that don't follow the format)
                console.error(`Error parsing commit: "${commit}" - ${error.message}`);
                return null;
            }
        })
        .filter(commit => commit !== null) // Remove null entries (parsing errors)
        .reverse();
    return commits;
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
async function updatePythonVersionFile(updatedPythonVersion, pythonPathVersionFile) {
    if (updatedPythonVersion) {
        await changePythonVersion(pythonPathVersionFile, updatedPythonVersion);
        console.log(`Version Updated Python: ${updatedNodeVersion}`);
    }
}
async function updateNodeVersionFile(updatedNodeVersion, nodePathVersionFile) {
    if (updatedNodeVersion) {
        const fileVersion = JSON.parse(await readFile(nodePathVersionFile, 'utf8'));
        fileVersion.version = updatedNodeVersion;
        await writeFile(nodePathVersionFile, JSON.stringify(fileVersion, null, 2));
        console.log(`Version Updated Node: ${updatedNodeVersion}`);
    }
}
function bumpVersion(currentVersion, bumpType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    if (bumpType === 'major') {
        console.log("major")
        return `${major + 1}.0.0`;
    } else if (bumpType === 'minor') {
        console.log("minor", `${major}.${minor + 1}.0`)
        return `${major}.${minor + 1}.0`;
    } else if (bumpType === 'patch') {
        console.log("patch")
        return `${major}.${minor}.${patch + 1}`;
    }
}
function findVersionBump(commit_parsed) {
    let versionBump = 'patch';
    if (commit_parsed.type === 'feat') {
        versionBump = 'minor';
    }
    if (commit_parsed["breaking-change"]) {
        versionBump = 'major';
    }
    return versionBump
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
// Función para leer la versión desde el archivo Python
async function readPythonVersion(filename) {
    try {
        const content = await readFile(filename, 'utf8');
        const match = content.match(/version=(\d+\.\d+\.\d+)/);
        if (match) {
            return match[1];
        }
    } catch (error) {
        console.error('Error al leer el archivo Python:', error);
    }
    return null;
}
// Función para cambiar la versión en el archivo Python
async function changePythonVersion(filename, newVersion) {
    try {
        let content = await readFile(filename, 'utf8');
        content = content.replace(/(version=)(\d+\.\d+\.\d+)/, `$1${newVersion}`);
        await writeFile(filename, content);
        console.log('Versión actualizada en el archivo Python.');
    } catch (error) {
        console.error('Error al cambiar la versión en el archivo Python:', error);
    }
}

const axios = require('axios');

const getCommits = async () => {
    const apiUrl = 'https://api.github.com/repos/gesinen/gesinen-api-chripstack/pulls/29/commits';
    const config = {
        headers: {
            'Authorization': 'token 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',
        }
    };
    const commits = await axios.get(apiUrl, config)
        .catch(error => {
            console.error('Error:', error);
        });
    return commits.data.map((item) => { return item.commit.message })
}


module.exports = { getCommits, organizeAndFilterCommits, execCommand, bumpVersion, transformCommitRawToObject, getPullRequestNumber, getBranch, readPythonVersion, findVersionBump, updatePythonVersionFile, updateNodeVersionFile }
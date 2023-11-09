require('dotenv').config();
const {
    execCommand,parseConventionalCommit,
    bumpVersion,
    updatePythonVersionFile, updateNodeVersionFile,
    readPythonVersion,
    findVersionBump
} = require('./utils.js');

const nodePathVersionFile = process.env.NODE_PATH_VERSION_FILE;
const pythonPathVersionFile = process.env.PYTHON_PATH_VERSION_FILE;

async function main() {
    // Parse commits from last version (in case they come from git log)
    const rawCommits = await execCommand(`git show --oneline --format=%s HEAD`);
    const commitTitle = rawCommits.split("\n\ndiff --git")[0]
    const commitObject = parseConventionalCommit(commitTitle)
    let updatedNodeVersion, updatedPythonVersion;
    // parse commit
    let versionBump = findVersionBump(commitObject)
    // Specify Scope
    if (commitObject.scope == 'python') {
        let currentPythonVersion = updatedPythonVersion || readPythonVersion(pythonPathVersionFile);
        updatedPythonVersion = bumpVersion(currentPythonVersion, versionBump);
        console.log(versionBump)
    }
    else if (commitObject.scope == 'node') {
        let currentNodeVersion = updatedNodeVersion || require(nodePathVersionFile).version;
        updatedNodeVersion = bumpVersion(currentNodeVersion, versionBump);
        console.log(versionBump)
    }
    else {
        console.log("Can't specify scope.")
    }
    // Update Files
    updatePythonVersionFile(updatedPythonVersion, pythonPathVersionFile)
    updateNodeVersionFile(updatedNodeVersion, nodePathVersionFile)
}
main().catch(error => {
    console.error(error);
    process.exit(1);
});
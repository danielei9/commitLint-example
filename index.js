require('dotenv').config();
const { organizeAndFilterCommits,
    execCommand,
    bumpVersion,
    transformCommitRawToObject,
    getBranch,
    updatePythonVersionFile, updateNodeVersionFile,
    readPythonVersion,
    findVersionBump
} = require('./utils.js');

const nodePathVersionFile = process.env.NODE_PATH_VERSION_FILE;
const pythonPathVersionFile = process.env.PYTHON_PATH_VERSION_FILE;

async function main() {
    // Parse commits from last version
    // const rawCommits = await execCommand(`git log --oneline --format=%s origin..iotPlatform `);
    const rawCommits = await execCommand(`git log --oneline --format=%s origin..${getBranch()}`);
    const commits = organizeAndFilterCommits(rawCommits)

    let updatedNodeVersion, updatedPythonVersion;
    for (const commit of commits) {
        // parse commit
        const commit_parsed = transformCommitRawToObject(commit.children[0].children)
        // find version Bump
        let versionBump = findVersionBump(commit_parsed)

        // Specify Scope
        if (commit_parsed.scope == 'python') {
            let currentPythonVersion = updatedPythonVersion || readPythonVersion(pythonPathVersionFile);
            updatedPythonVersion = bumpVersion(currentPythonVersion, versionBump);
        }
        else if (commit_parsed.scope == 'node') {
            let currentNodeVersion = updatedNodeVersion || require(nodePathVersionFile).version;
            updatedNodeVersion = bumpVersion(currentNodeVersion, versionBump);
        }
        else {
            // console.log("Can't specify scope.")
        }
    }
    // Update Files
    updatePythonVersionFile(updatedPythonVersion, pythonPathVersionFile)
    updateNodeVersionFile(updatedNodeVersion, nodePathVersionFile)
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
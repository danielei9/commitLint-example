require('dotenv').config();
const { parseConventionalCommit,
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
    // const commit = getCommit(process.argv[2])
    const commit = "fix(lint): lint"
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
const axios = require('axios');

const getCommit = async (token) => {
    
    const organization = 'danielei9';
    const repo = 'commitLint-example'
    const commitSha = '16fbe8ec40733175fa5b8f94852cac4e596c072b'

    const apiUrl = `https://api.github.com/repos/${organization}/${repo}/commits/${commitSha}`;
    const config = {
        headers: {
            'Authorization': `token ${token}`,
        }
    };
    const commit = await axios.get(apiUrl, config)
        .catch(error => {
            console.error('Error:', error);
        });
    return parseConventionalCommit(commit.data.commit.message)
}

console.log(getCommit())
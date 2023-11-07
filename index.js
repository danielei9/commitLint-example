
const { promisify } = require('util');
const fs = require('fs');
const { parser } = require('@conventional-commits/parser');
const { execCommand, bumpVersion, transformCommitRawToObject, getBranch, getPullRequestNumber } = require('./utils.js');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const nodePathVersionFile = './package.json'
const pythonPathVersionFile = './package.json'

async function main() {
    // Parse commits from last version
    const rawCommits = await execCommand(`git log --oneline --format=%s`);

    const commits = rawCommits.split('\n')
        .filter(Boolean)  // Remove empty lines
        .map(commit => {
            try {
                return parser(commit);
            } catch (error) {
                // Handle parsing errors (commits that don't follow the format)
                console.error(`Error parsing commit: "${commit}" - ${error.message}`);
                return null;
            }
        })
        .filter(commit => commit !== null);  // Remove null entries (parsing errors)

    let versionBump = 'patch';
    let currentVersion;
    let packageJsonPath;

    for (const commit of commits) {
        if (commit.scope == 'python'){
            currentVersion = require(nodePathVersionFile).version;
            packageJsonPath = './package.json';
        }
        if (commit.scope == 'node'){
            currentVersion = require(pythonPathVersionFile).version;
            packageJsonPath = './package.json';
        }

        const commit_parsed = transformCommitRawToObject(commit.children[0].children)

        if (commit_parsed.type.includes("!") || commit_parsed.type.includes("BREAKING CHANGE")) {
            versionBump = 'major'; 
            console.log("major")
        }
        if (commit_parsed.type === 'feat') {
            versionBump = 'minor';
            console.log("minor")
        }
        console.log("commit",commit_parsed)
    }
    
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

    throw new Error("No package json selected")
    // Update version following the rule
    const newVersion = bumpVersion(packageJson.version, versionBump);
    packageJson.version = newVersion;

    // Write changes in package.json
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(`Version Updated: ${newVersion}`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});


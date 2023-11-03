# CommitLint Example

Commitlint is a simple tool that lints your commit messages and makes sure they follow a set of rules.

It runs as a husky pre-commit hook, that is, it runs before the code is committed and blocks the commit in case it fails the lint checks.

## How to Use Commitlint with a Simple JavaScript Project

```bash
mkdir commitlint_example && cd commitlint_example

npm init
# OR
yarn init
# Just accept the defaults when prompted to configure the project
```

Initialize git

```bash
git init
```

Add node_modules to .gitignore.

Now we'll add a file called index.js and just log out something for now:

```js
console.log("Hello, World!!!")
```

## How to Set Up commitlint

```bash
npm install @commitlint/cli @commitlint/config-conventional --save-dev
# OR
yarn add -D @commitlint/cli @commitlint/config-conventional
```

We need to add some configuration to a file named commitlint.config.js like this:

```js
module.exports = {
    extends: [
        "@commitlint/config-conventional"
    ],
}
```

Now we need to install husky to run commitlint as a pre-commit hook.

```bash
npm install husky --save-dev
# OR
yarn add -D husky
```

We also need to enable the husky hooks:

```bash
npx husky install
# OR
yarn husky install
```
We can add a prepare step which enables the husky hooks upon installation:

```bash
npm set-script prepare "husky install"
```

```bash
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
# OR
yarn husky add .husky/commit-msg "yarn commitlint --edit $1"
```

probamos a hacer git commit

```bash
git add -A
git commit -m "set up a basic js project, added commitlint and husky for liniting commit messages"
```

Nos va a dar una serie de errores por que no seguimos lo convencional.

```bash
git commit -m "ci: initialised basic js project, added commitlint and husky to lint commit messages"
```


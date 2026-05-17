# Token Sentry

```ts
APP VERSION: 1.1.0
README UPDATED: 17/05/2026
AUTHOR: Diego Libonati
```

## Educational Purpose

This project was created primarily for **educational and learning purposes**.  
While it is well-structured and could technically be used in production, it is **not intended for commercialization**.  
The main goal is to explore and demonstrate best practices, patterns, and technologies in software development.

## Description

**Token Sentry** is a Visual Studio Code extension designed to prevent developers from accidentally committing sensitive data — such as API tokens, personal access tokens, and credentials — into a git repository.

### How it works

When you invoke the **Token Sentry: Check Files** command from the Command Palette (`Ctrl+Shift+P`), the extension queries the git staging area to retrieve the list of files that have been added for commit (`git diff --cached --name-only`). It then reads the content of each staged file and tests it against a set of configurable regex patterns. If any pattern matches a file's content, VS Code displays a warning message identifying the file and the pattern that triggered the alert, giving you the chance to review and remove the sensitive data before pushing it to the remote repository.

### Pattern detection

Patterns are the core of this extension — they are what determines whether a file is flagged as containing sensitive data. There are two pattern groups:

1. `defaultPatterns`: shipped with the extension. These should not be modified directly in PROD; they can be extended in DEV before being promoted to PROD.
2. `customPatterns`: user-defined patterns added at runtime through `settings.json` under the `Token Sentry` configuration scope.

Token Sentry ships with two built-in default patterns:

- **GitHub Token** — matches tokens with the `ghp_` prefix followed by 36 alphanumeric characters.
- **GitLab Token** — matches GitLab Personal Access Tokens with the `glpat-` prefix.

Beyond the defaults, you can define any number of **custom patterns** directly in VS Code's `settings.json` under the `token-sentry.customPatterns` key. Each pattern entry requires a regex string and an optional `flags` field (e.g. `g`, `gi`, `gm`). This makes the extension fully adaptable to any token format used in your stack — AWS access keys, database passwords, internal service credentials, or anything else that follows a recognizable pattern.

The configuration schema contributed by the extension is:

```ts
"configuration": {
    "title": "Token Sentry",
    "properties": {
        "token-sentry.defaultPatterns": {
            "type": "object",
            "default": {
                "GitLab Token": {
                    "pattern": "glpat-[A-Za-z0-9_-]{20}",
                    "flags": "g"
                },
                "GitHub Token": {
                    "pattern": "ghp_[A-Za-z0-9]{36}",
                    "flags": "g"
                }
            },
            "description": "Default patterns to detect tokens (do not modify directly)."
        },
        "token-sentry.customPatterns": {
            "type": "object",
            "default": {},
            "description": "Add your own Regex patterns (e.g. 'My Token': {'pattern': 'my_token_[0-9]{32}', 'flags': 'gi'} - flags key is OPTIONAL)."
        }
    }
}
```

### Commands

| Command                     | Description                                                                     |
| --------------------------- | ------------------------------------------------------------------------------- |
| `Token Sentry: Alive`       | Health check — confirms the extension is loaded and running.                    |
| `Token Sentry: Check Files` | Scans all staged files against the configured patterns and reports any matches. |

NOTE: You can use the Command Palette or open it with `Ctrl+Shift+P`. Enter the keywords `Token Sentry:` and run the command you want to use.

### Key characteristics

- **Staged-only scanning**: Token Sentry only inspects files already added to the git index. It does not scan the entire working directory or repository history.
- **Warning, not blocking**: The extension surfaces alerts as VS Code messages but does not prevent the commit from happening. The decision always remains with the developer.
- **Manual trigger**: The scan is invoked on demand from the Command Palette. There are no background watchers or automatic hooks.
- **Regex flexibility**: Custom patterns support any valid JavaScript regular expression, including flags, giving you full control over what gets flagged.
- **Graceful error handling**: Files that cannot be read (binary files, permission issues) are silently skipped so the scan always completes.

### Extending the extension

To add a new command to Token Sentry, follow these steps:

1. Create a file `src/commands/yourCommand.ts`. Separate the implementation function from the registration function.

```ts
import * as vscode from "vscode";

const yourCommand = (): void => {
  vscode.window.showInformationMessage("Your command output.");
};

export const registerYourCommand = (): vscode.Disposable => {
  return vscode.commands.registerCommand(
    "token-sentry.yourCommand",
    yourCommand
  );
};
```

2. Register it in `src/extension.ts`.

```ts
import { registerYourCommand } from "@/commands/yourCommand";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(registerYourCommand());
}
```

3. Add the entry in `package.json` under `contributes.commands`.

```ts
"commands": [
    {
    "command": "token-sentry.alive",
    "title": "Token Sentry: Alive"
    },
    {
    "command": "token-sentry.checkFiles",
    "title": "Token Sentry: Check Files"
    },
    {
    "command": "token-sentry.yourCommand",
    "title": "Token Sentry: Your Command"
    }
],
```

## Technologies used

1. Typescript

## Libraries used

#### Dependencies

```
"simple-git": "^3.27.0"
```

#### devDependencies

```
"@vscode/vsce": "^3.0.0"
"@eslint/js": "^9.0.0"
"@types/jest": "^29.5.14"
"@types/node": "^22.0.0"
"@types/vscode": "^1.99.0"
"esbuild": "^0.25.10"
"eslint": "^9.23.0"
"eslint-config-prettier": "^9.0.0"
"eslint-plugin-prettier": "^5.0.0"
"globals": "^15.0.0"
"husky": "^9.0.0"
"jest": "^29.7.0"
"lint-staged": "^15.0.0"
"prettier": "^3.0.0"
"ts-jest": "^29.3.2"
"tsx": "^4.19.3"
"typescript": "^5.6.3"
"typescript-eslint": "^8.0.0"
```

## Getting Started

With the dependencies above installed, you can spin up the extension locally in an Extension Development Host window:

1. Clone the repository
2. Navigate to the project folder
3. Make sure you are on the Node version pinned in `.nvmrc` (Node 22). If you use `nvm`, run `nvm use` to switch automatically. Engine compliance is enforced through `.npmrc` (`engine-strict=true`).
4. Execute: `npm install`
5. Open the project in VS Code
6. Press `F5` or go to `Run > Start Debugging`
7. Select one of the available configurations:
   - **Run Extension (Build once)** — builds once and launches the Extension Development Host
   - **Run Extension (Watch mode)** — rebuilds on every file save, ideal for active development
8. In the **Extension Development Host** window, open the Command Palette (`Ctrl+Shift+P`) and run `Token Sentry: Alive`

The repository also ships an `.editorconfig` file so editors honor the project's whitespace, encoding, and line-ending conventions out of the box. The recommended extension list in `.vscode/extensions.json` will offer to install EditorConfig, Jest, GitHub Actions, and YAML support when you open the project in VS Code.

If you prefer to run the watcher directly from a terminal without launching VS Code's debugger, use:

```bash
npm run dev
```

### Pre-Commit for Development

This project uses **Husky** and **lint-staged** to enforce code quality on every commit. The `prepare` script in `package.json` runs `husky` automatically right after `npm install`, so the git hook is wired up without any manual setup.

On every commit, lint-staged runs the following commands against staged `.ts` files:

```json
"lint-staged": {
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

You can also run the linting and formatting tooling manually:

```bash
npm run lint          # lint src
npm run lint:fix      # lint src and auto-fix
npm run lint:all      # lint src + __tests__ and auto-fix
npm run format        # prettier --write on src
npm run format:check  # prettier --check on src
npm run format:all    # prettier --write on src + __tests__ + scripts
```

For type checking only (no emit):

```bash
npm run check-types
```

## Testing

Once you can run the extension locally, you should be able to validate it with the test suite:

1. Navigate to the project folder
2. Execute: `npm test`

For coverage report:

```bash
npm run test:coverage
```

Watch mode is also available during development:

```bash
npm run test:watch
```

## Security Audit

Beyond the test suite, you should also audit the dependency tree before publishing.

### npm audit

Check for vulnerabilities in dependencies:

```bash
npm audit
```

## Build

Once the extension is tested and free of known vulnerabilities, the next step is producing a distributable bundle. Token Sentry uses `esbuild` (driven by `scripts/build.ts`) to bundle the extension into a single CommonJS file at `dist/extension.js`.

Production build (minified, no sourcemaps):

```bash
npm run build
```

Development build with watch mode (sourcemaps enabled):

```bash
npm run dev
```

The build is also wired into `vscode:prepublish`, so it runs automatically before packaging.

### Bundle analysis

When you need to inspect the contents of the production bundle, pass the `--analyze` flag to the build script:

```bash
tsx scripts/build.ts --production --analyze
```

This emits a `dist/metafile.json` file alongside the bundle and prints an `esbuild` size breakdown to the console, which is useful for spotting unexpectedly large dependencies before publishing a release.

## Continuous Integration

The repository ships with a **GitHub Actions** pipeline defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml). It runs automatically on every `push` and `pull_request` targeting the `main` branch. On `push` to `main`, the same workflow continues with two additional jobs that produce an automated release on the VS Code Marketplace.

### Pipeline overview

```
                      ┌─── PR or push to main ───┐
                      ▼                          ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   lint-and-audit     │─▶│     testing      │─▶│      build       │
│ eslint · tsc · fmt   │  │  jest --verbose  │  │ esbuild bundle   │
│       npm audit      │  │                  │  │                  │
└──────────────────────┘  └──────────────────┘  └──────────────────┘
                                                          │
                                       (only on push to main, sequentially)
                                                          ▼
                                                ┌──────────────────────┐
                                                │ check-publish-config │
                                                │  verify VSCE_PAT     │
                                                └──────────────────────┘
                                                          │
                                                          ▼
                                                ┌──────────────────────┐
                                                │  publish-marketplace │
                                                │ bump · changelog ·   │
                                                │ tag · vsce publish   │
                                                └──────────────────────┘
```

### Validation jobs (run on every PR and push)

1. **`lint-and-audit`** — `npm run lint`, `npm run check-types`, `npm run format:check`, and `npm audit --audit-level=high`.
2. **`testing`** — `npm run test` (Jest in headless mode against the `vscode` mock).
3. **`build`** — smoke test that `npm run build` produces a production bundle at `dist/extension.js` via `esbuild`.

### Release jobs (only on push to `main`)

4. **`check-publish-config`** — reads the `VSCE_PAT` repository secret and exposes a boolean output. When the secret is missing (for example on a fresh fork), the publish stage is reported as skipped so the rest of the pipeline still succeeds.
5. **`publish-marketplace`** — inspects the commits since the latest tag, decides the next SemVer version using [Conventional Commits](#conventional-commits-required-for-releases), generates the changelog section, updates `CHANGELOG.md` and `package.json`, commits and tags the release as `github-actions[bot]`, pushes back to `main`, and finally publishes the extension to the VS Code Marketplace via `npx vsce publish`. The release commit subject is `chore(release): vX.Y.Z [skip release]` so the follow-up push does not re-trigger the workflow.

### Conventional Commits (required for releases)

Commits merged into `main` must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) so the pipeline can compute the next version and group the changelog entries.

| Commit prefix | Version bump | Example |
|---|---|---|
| `feat:` / `feat(scope):` | **MINOR** | `feat(scan): add JWT detector` |
| `fix:` / `fix(scope):` | **PATCH** | `fix: skip binary files during scan` |
| `perf:`, `refactor:`, `docs:`, `build:`, `ci:`, `chore:`, `style:`, `test:` | **PATCH** | `refactor: extract pattern loader` |
| `feat!:` / `fix!:` or `BREAKING CHANGE:` in the body | **MAJOR** | `feat!: rename token-sentry.scan command` |

When a push contains multiple commits, the highest applicable bump wins (a single `feat:` among many `fix:` triggers a MINOR bump). If you squash-merge PRs, configure the repo to use the PR title as the squash commit message and write the **PR title** following the convention.

### Skipping a release

If you need to push a change to `main` without producing a release (e.g. tweaking job names in the workflow, fixing a typo in the README), append `[skip release]` to the commit message. The validation jobs (lint, test, build) still run; only `check-publish-config` and `publish-marketplace` are skipped.

```bash
git commit -m "ci: rename build job for clarity [skip release]"
```

To skip **everything** including validation, use GitHub's standard `[skip ci]` marker instead.

### Where the build outputs live

| Output | Location |
|---|---|
| Validation logs (lint, tests) | **Actions** tab on GitHub |
| Production bundle (`dist/extension.js`) | Ephemeral, inside the runner |
| Published `.vsix` per version | [Visual Studio Marketplace](https://marketplace.visualstudio.com/) |
| Version history & notes | [`CHANGELOG.md`](CHANGELOG.md) + git tags |

> **Note:** Token Sentry is published as a VS Code extension, so released artifacts live on the **Visual Studio Marketplace** rather than the GitHub Releases page. The Marketplace listing is the canonical install source for users.

### Repository setup required for releases

For the release jobs to push tags and commits back to `main` and publish the extension, the repository needs:

1. **Settings → Secrets and variables → Actions**: add a `VSCE_PAT` secret containing an Azure DevOps Personal Access Token with `Marketplace > Manage` scope. See [Get a Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token).
2. **Settings → Actions → General → Workflow permissions**: set to *Read and write permissions*.
3. **Branch protection on `main`**: if enabled, allow the `github-actions[bot]` to bypass the PR requirement, or disable the protection for the bot. Otherwise `publish-marketplace` will fail when pushing the version bump.

### Running the same checks locally

```bash
# lint-and-audit
npm run lint
npm run check-types
npm run format:check
npm audit --audit-level=high

# testing
npm run test

# build
npm run build
```

## Production

With the bundle in place, the extension is ready to be packaged and published to the VS Code Marketplace. Before promoting a new release, make sure you have run the previous stages:

1. [Testing](#testing) — full test suite + coverage.
2. [Security Audit](#security-audit) — `npm audit`.
3. [Build](#build) — production bundle at `dist/extension.js`.

Then package and publish using `@vscode/vsce`:

```bash
npm run ext:package   # produces a .vsix file
npm run ext:publish   # publishes to the Marketplace
```

The `.vscodeignore` file uses a deny-by-default policy: everything in the repository is excluded from the published package, and only `dist/**`, `public/icon.png`, `package.json`, `README.md`, `CHANGELOG.md`, and `LICENSE` are explicitly allowed. This keeps the published artifact minimal and prevents source files, configuration, or development tooling from leaking into the Marketplace.

In practice, manual `vsce` invocations are only needed for local smoke tests or emergency releases — under normal conditions every push to `main` is published automatically by the [Continuous Integration](#continuous-integration) pipeline.

## Known Issues

None at the moment.

## Portfolio Link

[`https://www.diegolibonati.com.ar/#/project/token-sentry`](https://www.diegolibonati.com.ar/#/project/token-sentry)

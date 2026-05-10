# Token Sentry

```ts
APP VERSION: 1.1.0
README UPDATED: 10/05/2026
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
3. Execute: `npm install`
4. Open the project in VS Code
5. Press `F5` or go to `Run > Start Debugging`
6. Select one of the available configurations:
   - **Run Extension (Build once)** — builds once and launches the Extension Development Host
   - **Run Extension (Watch mode)** — rebuilds on every file save, ideal for active development
7. In the **Extension Development Host** window, open the Command Palette (`Ctrl+Shift+P`) and run `Token Sentry: Alive`

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

## Known Issues

None at the moment.

## Portfolio Link

[`https://www.diegolibonati.com.ar/#/project/token-sentry`](https://www.diegolibonati.com.ar/#/project/token-sentry)

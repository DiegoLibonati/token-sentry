# TokenSentry

## Educational Purpose

This project was created primarily for **educational and learning purposes**.  
While it is well-structured and could technically be used in production, it is **not intended for commercialization**.  
The main goal is to explore and demonstrate best practices, patterns, and technologies in software development.

## Getting Started

## Getting Started

1. Clone the repository
2. Navigate to the project folder
3. Execute: `npm install`
4. Open the project in VS Code
5. Press `F5` or go to `Run > Start Debugging`
6. Select one of the available configurations:
   - **Run Extension (Build once)** — builds once and launches the Extension Development Host
   - **Run Extension (Watch mode)** — rebuilds on every file save, ideal for active development
7. In the **Extension Development Host** window, open the Command Palette (`Ctrl+Shift+P`) and run `TokenSentry: Alive`

NOTE: You can use the Command Palette or open it with Ctrl+Shift+P. Enter the keywords: TokenSentry: and run the command you want to use.

## Description

TokenSentry is an extension that allows to analyze the files added before or during the commit to detect that no sensitive data is uploaded.

## Technologies used

1. Typescript

## Libraries used

#### Dependencies

```
"simple-git": "^3.27.0"
```

#### devDependencies

```
"@eslint/js": "^9.0.0"
"@types/jest": "^29.5.14"
"@types/node": "20.x"
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

## Portfolio Link

[`https://www.diegolibonati.com.ar/#/project/TokenSentry`](https://www.diegolibonati.com.ar/#/project/TokenSentry)

## Video

https://github.com/user-attachments/assets/f710b19b-0ed3-4dc8-8481-7b41893482b6

## Testing

1. Navigate to the project folder
2. Execute: `npm test`

For coverage report:

```bash
npm run test:coverage
```

## Security

### npm audit

Check for vulnerabilities in dependencies:

```bash
npm audit
```

## Documentation Extension

### Version

```ts
APP VERSION: 1.1.0
README UPDATED: 09/04/2026
AUTHOR: Diego Libonati
```

### Patterns

- Patterns are very important in this extension because thanks to these patterns we will be able to detect if there is any sensitive pattern in the content of the files we are going to commit.

1. `defaultPatterns`: The default patterns are patterns that we are going to configure by default in our extension. This should not be touched in PROD but we can add in DEV for PROD.
2. `customPatterns`: Custom patterns are patterns that we will be able to add in PROD through `settings.json`. We must look for in configuration the keyword: `TokenSentry: `.

```ts
"configuration": {
    "title": "TokenSentry",
    "properties": {
        "tokenSentry.defaultPatterns": {
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
        "tokenSentry.customPatterns": {
            "type": "object",
            "default": {},
            "description": "Add your own Regex patterns (e.g. 'My Token': {'pattern': 'my_token_[0-9]{32}', 'flags': 'gi'} - flags key is OPTIONAL)."
        }
    }
}
```

### Create a new command

1. Create a file `src/commands/yourCommand.ts`. Separate the implementation function from the registration function.

```ts
import * as vscode from "vscode";

const yourCommand = (): void => {
  vscode.window.showInformationMessage("Your command output.");
};

export const registerYourCommand = (): vscode.Disposable => {
  return vscode.commands.registerCommand(
    "tokensentry.yourCommand",
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
    "command": "tokensentry.alive",
    "title": "TokenSentry: Alive"
    },
    {
    "command": "tokensentry.checkFiles",
    "title": "TokenSentry: Check Files"
    },
    {
    "command": "tokensentry.yourCommand",
    "title": "TokenSentry: Your Command"
    }
],
```

## Known Issues

None at the moment.

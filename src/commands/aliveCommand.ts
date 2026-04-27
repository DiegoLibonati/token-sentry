import * as vscode from "vscode";

const aliveCommand = (): void => {
  vscode.window.showInformationMessage("Hello world from Token Sentry.");
};

export const registerAliveCommand = (): vscode.Disposable => {
  return vscode.commands.registerCommand("token-sentry.alive", aliveCommand);
};

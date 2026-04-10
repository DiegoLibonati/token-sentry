import * as vscode from "vscode";

const aliveCommand = (): void => {
  vscode.window.showInformationMessage("Hello world from TokenSentry.");
};

export const registerAliveCommand = (): vscode.Disposable => {
  return vscode.commands.registerCommand("tokensentry.alive", aliveCommand);
};

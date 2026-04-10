import type * as vscode from "vscode";

import { registerAliveCommand } from "@/commands/aliveCommand";
import { registerCheckFilesCommand } from "@/commands/checkFilesCommand";

export function activate(context: vscode.ExtensionContext): void {
  console.log("Congratulations, your 'TokenSentry' extension is now active.");

  context.subscriptions.push(registerAliveCommand());
  context.subscriptions.push(registerCheckFilesCommand());
}

export function deactivate(): void {
  // no-empty-function
}

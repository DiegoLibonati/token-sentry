import type * as vscode from "vscode";

export const mockExtensionContext = {
  subscriptions: [] as vscode.Disposable[],
} as unknown as vscode.ExtensionContext;

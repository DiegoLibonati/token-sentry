import * as fs from "fs";
import * as vscode from "vscode";
import simpleGit from "simple-git";

import { loadPatterns } from "@/helpers/loadPatterns";
import { getDirectoriesNameByPath } from "@/helpers/getDirectoriesNameByPath";
import { getFullPathFile } from "@/helpers/getFullPathFile";

import { GIT_FOLDER_NAME } from "@/constants/vars";

const checkFiles = async (): Promise<void> => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const patterns = loadPatterns();

  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("You are not standing on any folder.");
    return;
  }

  const currentDir = workspaceFolders[0]!.uri.fsPath;

  const nameDirs = getDirectoriesNameByPath(currentDir);

  if (!nameDirs.includes(GIT_FOLDER_NAME)) {
    vscode.window.showErrorMessage("Git is not initialized in this folder.");
    return;
  }

  vscode.window.showInformationMessage("Checking for tokens...");

  const git = simpleGit({ baseDir: currentDir });

  const files = await git.diff(["--cached", "--name-only"]);
  const filenames = files.split("\n").filter((f) => f);

  if (filenames.length === 0) {
    vscode.window.showErrorMessage("There are no files added to commit.");
    return;
  }

  for (const filename of filenames) {
    const filePath = getFullPathFile(currentDir, filename);

    let content: string;

    try {
      content = await fs.promises.readFile(filePath, "utf8");
    } catch {
      continue;
    }

    for (const [patternName, pattern] of Object.entries(patterns)) {
      pattern.lastIndex = 0;

      if (pattern.test(content)) {
        vscode.window.showWarningMessage(
          `Potential token detected in ${filename} with pattern: ${patternName}.`
        );
        break;
      }
    }
  }

  vscode.window.showInformationMessage("Analysis successfully completed.");
};

export const registerCheckFilesCommand = (): vscode.Disposable => {
  return vscode.commands.registerCommand("token-sentry.checkFiles", checkFiles);
};

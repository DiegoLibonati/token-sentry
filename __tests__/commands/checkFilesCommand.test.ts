import simpleGit from "simple-git";
import * as fs from "fs";

import { registerCheckFilesCommand } from "@/commands/checkFilesCommand";
import { loadPatterns } from "@/helpers/loadPatterns";
import { getDirectoriesNameByPath } from "@/helpers/getDirectoriesNameByPath";
import { getFullPathFile } from "@/helpers/getFullPathFile";

import { workspace, window, commands } from "@__tests__/__mocks__/vscode.mock";

const mockSimpleGit = simpleGit as unknown as jest.Mock;
const mockReadFile = fs.promises.readFile as jest.Mock;
const mockLoadPatterns = loadPatterns as jest.Mock;
const mockGetDirectoriesNameByPath = getDirectoriesNameByPath as jest.Mock;
const mockGetFullPathFile = getFullPathFile as jest.Mock;
const mockDiff = jest.fn();

jest.mock("simple-git");
jest.mock("fs", () => ({ promises: { readFile: jest.fn() } }));
jest.mock("@/helpers/loadPatterns");
jest.mock("@/helpers/getDirectoriesNameByPath");
jest.mock("@/helpers/getFullPathFile");

describe("checkFilesCommand", () => {
  const getCheckFilesCallback = (): (() => Promise<void>) => {
    registerCheckFilesCommand();
    return commands.registerCommand.mock.calls[0]![1] as () => Promise<void>;
  };

  beforeEach(() => {
    workspace.workspaceFolders = [{ uri: { fsPath: "/project" } }];
    mockSimpleGit.mockReturnValue({ diff: mockDiff });
    mockDiff.mockResolvedValue("file.ts\n");
    mockLoadPatterns.mockReturnValue({});
    mockGetDirectoriesNameByPath.mockReturnValue([".git", "src"]);
    mockGetFullPathFile.mockReturnValue("/project/file.ts");
    mockReadFile.mockResolvedValue("safe content");
  });

  it("registers command with correct id", () => {
    registerCheckFilesCommand();

    expect(commands.registerCommand).toHaveBeenCalledWith(
      "tokensentry.checkFiles",
      expect.any(Function)
    );
  });

  it("shows error when workspaceFolders is undefined", async () => {
    workspace.workspaceFolders = undefined;

    await getCheckFilesCallback()();

    expect(window.showErrorMessage).toHaveBeenCalledWith(
      "You are not standing on any folder."
    );
  });

  it("shows error when workspaceFolders is empty", async () => {
    workspace.workspaceFolders = [];

    await getCheckFilesCallback()();

    expect(window.showErrorMessage).toHaveBeenCalledWith(
      "You are not standing on any folder."
    );
  });

  it("shows error when .git folder is not present", async () => {
    mockGetDirectoriesNameByPath.mockReturnValue(["src", "node_modules"]);

    await getCheckFilesCallback()();

    expect(window.showErrorMessage).toHaveBeenCalledWith(
      "Git is not initialized in this folder."
    );
  });

  it("shows error when there are no staged files", async () => {
    mockDiff.mockResolvedValue("");

    await getCheckFilesCallback()();

    expect(window.showErrorMessage).toHaveBeenCalledWith(
      "There are no files added to commit."
    );
  });

  it("shows warning when a token is detected", async () => {
    mockLoadPatterns.mockReturnValue({
      "GitHub Token": /ghp_[A-Za-z0-9]{36}/g,
    });
    mockReadFile.mockResolvedValue(
      "const token = 'ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';"
    );

    await getCheckFilesCallback()();

    expect(window.showWarningMessage).toHaveBeenCalledWith(
      "Potential token detected in file.ts with pattern: GitHub Token."
    );
  });

  it("shows completion message when no tokens are detected", async () => {
    mockLoadPatterns.mockReturnValue({
      "GitHub Token": /ghp_[A-Za-z0-9]{36}/g,
    });
    mockReadFile.mockResolvedValue("const x = 'safe content';");

    await getCheckFilesCallback()();

    expect(window.showInformationMessage).toHaveBeenCalledWith(
      "Analysis successfully completed."
    );
  });

  it("skips a file when readFile throws and continues to completion", async () => {
    mockLoadPatterns.mockReturnValue({ Token: /secret/ });
    mockReadFile.mockRejectedValue(new Error("File not found"));

    await getCheckFilesCallback()();

    expect(window.showWarningMessage).not.toHaveBeenCalled();
    expect(window.showInformationMessage).toHaveBeenCalledWith(
      "Analysis successfully completed."
    );
  });
});

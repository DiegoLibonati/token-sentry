import * as fs from "fs";
import * as vscode from "vscode";

import simpleGit from "simple-git";

import { registerCheckFilesCommand } from "@/commands/checkFilesCommand";

interface MockWorkspace {
  workspaceFolders: { uri: { fsPath: string } }[] | undefined;
}

const mockSimpleGit = simpleGit as jest.MockedFunction<typeof simpleGit>;
const mockReadFile = fs.promises.readFile as jest.MockedFunction<
  typeof fs.promises.readFile
>;
const mockReaddirSync = fs.readdirSync as jest.MockedFunction<
  typeof fs.readdirSync
>;
const mockWorkspace = vscode.workspace as unknown as MockWorkspace;
const mockWorkspaceFolder = { uri: { fsPath: "/mock/workspace" } };

jest.mock("fs", () => ({
  promises: { readFile: jest.fn() },
  readdirSync: jest.fn(),
}));

jest.mock("simple-git", () => jest.fn());

describe("checkFilesCommand", () => {
  let capturedCallback!: () => Promise<void>;
  let mockGetConfig: jest.Mock;

  beforeEach(() => {
    mockWorkspace.workspaceFolders = undefined;

    mockGetConfig = jest.fn().mockReturnValue({});
    jest.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
      get: mockGetConfig,
      has: jest.fn(),
      update: jest.fn(),
      inspect: jest.fn(),
    } as unknown as vscode.WorkspaceConfiguration);

    jest
      .spyOn(vscode.commands, "registerCommand")
      .mockImplementation((_id, callback) => {
        capturedCallback = callback as () => Promise<void>;
        return { dispose: jest.fn() } as unknown as vscode.Disposable;
      });

    registerCheckFilesCommand();
  });

  describe("registerCheckFilesCommand", () => {
    it("should register the command with the correct id", () => {
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "token-sentry.checkFiles",
        expect.any(Function)
      );
    });
  });

  describe("workspace validation", () => {
    it("should show error when no workspace folders are open", async () => {
      mockWorkspace.workspaceFolders = undefined;

      await capturedCallback();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "You are not standing on any folder."
      );
    });

    it("should show error when workspace folders array is empty", async () => {
      mockWorkspace.workspaceFolders = [];

      await capturedCallback();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "You are not standing on any folder."
      );
    });

    it("should not proceed to git check when no workspace folders", async () => {
      mockWorkspace.workspaceFolders = undefined;

      await capturedCallback();

      expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });
  });

  describe("git validation", () => {
    beforeEach(() => {
      mockWorkspace.workspaceFolders = [mockWorkspaceFolder];
    });

    it("should show error when git is not initialized", async () => {
      mockReaddirSync.mockReturnValue([
        { isDirectory: (): boolean => true, name: "src" },
        { isDirectory: (): boolean => false, name: "package.json" },
      ] as any);

      await capturedCallback();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "Git is not initialized in this folder."
      );
    });

    it("should not proceed to analysis when git is not initialized", async () => {
      mockReaddirSync.mockReturnValue([] as any);

      await capturedCallback();

      expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
    });
  });

  describe("staged files validation", () => {
    beforeEach(() => {
      mockWorkspace.workspaceFolders = [mockWorkspaceFolder];
      mockReaddirSync.mockReturnValue([
        { isDirectory: (): boolean => true, name: ".git" },
        { isDirectory: (): boolean => true, name: "src" },
      ] as any);
    });

    it("should show information message when analysis starts", async () => {
      const mockGitInstance = {
        diff: jest.fn().mockResolvedValue("src/file.ts\n"),
      };
      mockSimpleGit.mockReturnValue(mockGitInstance as any);
      mockReadFile.mockResolvedValue("const x = 1;" as any);

      await capturedCallback();

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Checking for tokens..."
      );
    });

    it("should show error when no staged files", async () => {
      const mockGitInstance = { diff: jest.fn().mockResolvedValue("") };
      mockSimpleGit.mockReturnValue(mockGitInstance as any);

      await capturedCallback();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "There are no files added to commit."
      );
    });

    it("should show error when staged files list contains only newlines", async () => {
      const mockGitInstance = { diff: jest.fn().mockResolvedValue("\n\n") };
      mockSimpleGit.mockReturnValue(mockGitInstance as any);

      await capturedCallback();

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "There are no files added to commit."
      );
    });
  });

  describe("token detection", () => {
    beforeEach(() => {
      mockWorkspace.workspaceFolders = [mockWorkspaceFolder];
      mockReaddirSync.mockReturnValue([
        { isDirectory: (): boolean => true, name: ".git" },
      ] as any);
      const mockGitInstance = {
        diff: jest.fn().mockResolvedValue("src/config.ts\n"),
      };
      mockSimpleGit.mockReturnValue(mockGitInstance as any);
    });

    it("should show warning when a token pattern matches file content", async () => {
      mockGetConfig.mockImplementation((key: string) => {
        if (key === "defaultPatterns")
          return { AWS_KEY: { pattern: "AKIA[A-Z0-9]{16}" } };
        return {};
      });
      mockReadFile.mockResolvedValue(
        "const key = 'AKIAIOSFODNN7EXAMPLE'" as any
      );

      await capturedCallback();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        "Potential token detected in src/config.ts with pattern: AWS_KEY."
      );
    });

    it("should show completion message when no tokens are found", async () => {
      mockReadFile.mockResolvedValue("const x = 1; const y = 2;" as any);

      await capturedCallback();

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Analysis successfully completed."
      );
    });

    it("should continue and complete when a file cannot be read", async () => {
      mockReadFile.mockRejectedValue(new Error("ENOENT: no such file"));

      await capturedCallback();

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Analysis successfully completed."
      );
    });

    it("should show warning and skip an invalid pattern", async () => {
      mockGetConfig.mockImplementation((key: string) => {
        if (key === "defaultPatterns")
          return { INVALID: { pattern: "[invalid(" } };
        return {};
      });
      mockReadFile.mockResolvedValue("some content" as any);

      await capturedCallback();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
        'Token Sentry: invalid pattern skipped — "INVALID".'
      );
    });

    it("should break after first matching pattern per file", async () => {
      mockGetConfig.mockImplementation((key: string) => {
        if (key === "defaultPatterns")
          return {
            PATTERN_A: { pattern: "token_a" },
            PATTERN_B: { pattern: "token_b" },
          };
        return {};
      });
      mockReadFile.mockResolvedValue("has token_a and token_b" as any);

      await capturedCallback();

      expect(vscode.window.showWarningMessage).toHaveBeenCalledTimes(1);
    });
  });
});

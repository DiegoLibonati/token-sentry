import * as vscode from "vscode";

import { registerAliveCommand } from "@/commands/aliveCommand";

describe("aliveCommand", () => {
  describe("registerAliveCommand", () => {
    it("should register the command with the correct id", () => {
      registerAliveCommand();

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "token-sentry.alive",
        expect.any(Function)
      );
    });
  });

  describe("command execution", () => {
    it("should show information message when executed", () => {
      let capturedCallback!: () => void;
      jest
        .spyOn(vscode.commands, "registerCommand")
        .mockImplementation((_id, callback) => {
          capturedCallback = callback as () => void;
          return { dispose: jest.fn() } as unknown as vscode.Disposable;
        });

      registerAliveCommand();
      capturedCallback();

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        "Hello world from Token Sentry."
      );
    });

    it("should show information message exactly once when executed", () => {
      let capturedCallback!: () => void;
      jest
        .spyOn(vscode.commands, "registerCommand")
        .mockImplementation((_id, callback) => {
          capturedCallback = callback as () => void;
          return { dispose: jest.fn() } as unknown as vscode.Disposable;
        });

      registerAliveCommand();
      capturedCallback();

      expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
    });
  });
});

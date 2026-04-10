import { registerAliveCommand } from "@/commands/aliveCommand";

import { window, commands } from "@__tests__/__mocks__/vscode.mock";

describe("aliveCommand", () => {
  it("registers command with correct id", () => {
    registerAliveCommand();

    expect(commands.registerCommand).toHaveBeenCalledWith(
      "tokensentry.alive",
      expect.any(Function)
    );
  });

  it("shows information message when command is executed", () => {
    registerAliveCommand();

    const callback = commands.registerCommand.mock.calls[0]![1] as () => void;
    callback();

    expect(window.showInformationMessage).toHaveBeenCalledWith(
      "Hello world from TokenSentry."
    );
  });
});

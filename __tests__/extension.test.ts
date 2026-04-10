import { activate, deactivate } from "@/extension";
import { registerAliveCommand } from "@/commands/aliveCommand";
import { registerCheckFilesCommand } from "@/commands/checkFilesCommand";

import { mockExtensionContext } from "@__tests__/__mocks__/extensionContext.mock";

const mockRegisterAliveCommand = registerAliveCommand as jest.Mock;
const mockRegisterCheckFilesCommand = registerCheckFilesCommand as jest.Mock;

jest.mock("@/commands/aliveCommand");
jest.mock("@/commands/checkFilesCommand");

describe("extension", () => {
  beforeEach(() => {
    mockExtensionContext.subscriptions.length = 0;
  });

  it("registers all commands on activate", () => {
    activate(mockExtensionContext);

    expect(mockRegisterAliveCommand).toHaveBeenCalled();
    expect(mockRegisterCheckFilesCommand).toHaveBeenCalled();
  });

  it("pushes command disposables into subscriptions", () => {
    const mockDisposable = { dispose: jest.fn() };
    mockRegisterAliveCommand.mockReturnValue(mockDisposable);
    mockRegisterCheckFilesCommand.mockReturnValue(mockDisposable);

    activate(mockExtensionContext);

    expect(mockExtensionContext.subscriptions).toContain(mockDisposable);
  });

  it("does not throw on deactivate", () => {
    expect(() => {
      deactivate();
    }).not.toThrow();
  });
});

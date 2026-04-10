import { loadPatterns } from "@/helpers/loadPatterns";

import { workspace, window } from "@__tests__/__mocks__/vscode.mock";

const setupConfig = (
  defaultPatterns: Record<string, unknown> = {},
  customPatterns: Record<string, unknown> = {}
): void => {
  const mockGet = jest
    .fn()
    .mockReturnValueOnce(defaultPatterns)
    .mockReturnValueOnce(customPatterns);
  (workspace.getConfiguration as jest.Mock).mockReturnValue({ get: mockGet });
};

describe("loadPatterns", () => {
  it("returns empty object when no patterns are configured", () => {
    setupConfig();

    expect(loadPatterns()).toEqual({});
  });

  it("compiles patterns into RegExp instances", () => {
    setupConfig({
      "GitHub Token": { pattern: "ghp_[A-Za-z0-9]{36}", flags: "g" },
    });

    const result = loadPatterns();

    expect(result["GitHub Token"]).toBeInstanceOf(RegExp);
  });

  it("applies valid flags when compiling patterns", () => {
    setupConfig({ Token: { pattern: "abc", flags: "gi" } });

    const result = loadPatterns();

    expect(result.Token!.flags).toContain("g");
    expect(result.Token!.flags).toContain("i");
  });

  it("compiles pattern without flags when flags are invalid", () => {
    setupConfig({ Token: { pattern: "abc", flags: "gg" } });

    const result = loadPatterns();

    expect(result.Token).toBeInstanceOf(RegExp);
    expect(result.Token!.flags).toBe("");
  });

  it("skips invalid patterns and shows a warning", () => {
    setupConfig({ Bad: { pattern: "[invalid(" } });

    loadPatterns();

    expect(window.showWarningMessage).toHaveBeenCalledWith(
      'TokenSentry: invalid pattern skipped — "Bad".'
    );
  });

  it("merges default and custom patterns", () => {
    setupConfig(
      { "GitHub Token": { pattern: "ghp_[A-Za-z0-9]{36}", flags: "g" } },
      { Custom: { pattern: "custom_[0-9]+", flags: "g" } }
    );

    const result = loadPatterns();

    expect(result["GitHub Token"]).toBeInstanceOf(RegExp);
    expect(result.Custom).toBeInstanceOf(RegExp);
  });
});

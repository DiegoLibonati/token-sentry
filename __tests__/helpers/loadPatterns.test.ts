import * as vscode from "vscode";

import { loadPatterns } from "@/helpers/loadPatterns";

describe("loadPatterns", () => {
  let mockGetConfig: jest.Mock;

  beforeEach(() => {
    mockGetConfig = jest.fn().mockReturnValue({});
    jest.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
      get: mockGetConfig,
      has: jest.fn(),
      update: jest.fn(),
      inspect: jest.fn(),
    } as unknown as vscode.WorkspaceConfiguration);
  });

  it("should call getConfiguration with the token-sentry scope", () => {
    loadPatterns();

    expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith(
      "token-sentry"
    );
  });

  it("should return empty object when no patterns are configured", () => {
    const result = loadPatterns();

    expect(result).toEqual({});
  });

  it("should create a RegExp from a valid default pattern with flags", () => {
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "defaultPatterns")
        return { MY_TOKEN: { pattern: "abc[0-9]+", flags: "g" } };
      return {};
    });

    const result = loadPatterns();

    expect(result.MY_TOKEN).toBeInstanceOf(RegExp);
    expect(result.MY_TOKEN!.source).toBe("abc[0-9]+");
    expect(result.MY_TOKEN!.flags).toContain("g");
  });

  it("should create a RegExp from a valid custom pattern", () => {
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "customPatterns")
        return { MY_CUSTOM: { pattern: "secret_[a-z]+" } };
      return {};
    });

    const result = loadPatterns();

    expect(result.MY_CUSTOM).toBeInstanceOf(RegExp);
    expect(result.MY_CUSTOM!.source).toBe("secret_[a-z]+");
  });

  it("should merge default and custom patterns", () => {
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "defaultPatterns")
        return { DEFAULT: { pattern: "default_[0-9]+" } };
      if (key === "customPatterns")
        return { CUSTOM: { pattern: "custom_[a-z]+" } };
      return {};
    });

    const result = loadPatterns();

    expect(result).toHaveProperty("DEFAULT");
    expect(result).toHaveProperty("CUSTOM");
  });

  it("should override default patterns with custom patterns of the same name", () => {
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "defaultPatterns")
        return { TOKEN: { pattern: "old_pattern" } };
      if (key === "customPatterns")
        return { TOKEN: { pattern: "new_pattern" } };
      return {};
    });

    const result = loadPatterns();

    expect(result.TOKEN!.source).toBe("new_pattern");
  });

  it("should skip invalid patterns and show a warning", () => {
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "defaultPatterns")
        return { INVALID: { pattern: "[invalid(" } };
      return {};
    });

    const result = loadPatterns();

    expect(result).not.toHaveProperty("INVALID");
    expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
      'Token Sentry: invalid pattern skipped — "INVALID".'
    );
  });

  it("should create pattern without flags when flags are undefined", () => {
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "defaultPatterns")
        return { NO_FLAGS: { pattern: "test_[0-9]+" } };
      return {};
    });

    const result = loadPatterns();

    expect(result.NO_FLAGS).toBeInstanceOf(RegExp);
    expect(result.NO_FLAGS!.flags).toBe("");
  });

  it("should create pattern without flags when flags are invalid", () => {
    mockGetConfig.mockImplementation((key: string) => {
      if (key === "defaultPatterns")
        return { BAD_FLAGS: { pattern: "test_[0-9]+", flags: "xyz" } };
      return {};
    });

    const result = loadPatterns();

    expect(result.BAD_FLAGS).toBeInstanceOf(RegExp);
    expect(result.BAD_FLAGS!.flags).toBe("");
  });
});

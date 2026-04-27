import * as fs from "fs";

import { getDirectoriesNameByPath } from "@/helpers/getDirectoriesNameByPath";

const mockReaddirSync = fs.readdirSync as jest.MockedFunction<
  typeof fs.readdirSync
>;

jest.mock("fs");

describe("getDirectoriesNameByPath", () => {
  it("should return directory names from the given path", () => {
    mockReaddirSync.mockReturnValue([
      { isDirectory: (): boolean => true, name: "src" },
      { isDirectory: (): boolean => true, name: "node_modules" },
    ] as any);

    const result = getDirectoriesNameByPath("/mock/path");

    expect(result).toEqual(["src", "node_modules"]);
  });

  it("should exclude files from the result", () => {
    mockReaddirSync.mockReturnValue([
      { isDirectory: (): boolean => true, name: "src" },
      { isDirectory: (): boolean => false, name: "package.json" },
      { isDirectory: (): boolean => true, name: "dist" },
    ] as any);

    const result = getDirectoriesNameByPath("/mock/path");

    expect(result).toEqual(["src", "dist"]);
  });

  it("should return empty array when directory has no subdirectories", () => {
    mockReaddirSync.mockReturnValue([
      { isDirectory: (): boolean => false, name: "file.txt" },
      { isDirectory: (): boolean => false, name: "index.ts" },
    ] as any);

    const result = getDirectoriesNameByPath("/mock/path");

    expect(result).toEqual([]);
  });

  it("should return empty array when directory is empty", () => {
    mockReaddirSync.mockReturnValue([] as any);

    const result = getDirectoriesNameByPath("/mock/path");

    expect(result).toEqual([]);
  });

  it("should call readdirSync with the correct path and withFileTypes option", () => {
    mockReaddirSync.mockReturnValue([]);

    getDirectoriesNameByPath("/mock/path");

    expect(mockReaddirSync).toHaveBeenCalledWith("/mock/path", {
      withFileTypes: true,
    });
  });
});

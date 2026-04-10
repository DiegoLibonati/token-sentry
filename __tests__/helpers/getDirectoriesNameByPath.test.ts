import * as fs from "fs";

import { getDirectoriesNameByPath } from "@/helpers/getDirectoriesNameByPath";

const mockReaddirSync = fs.readdirSync as jest.Mock;

jest.mock("fs");

describe("getDirectoriesNameByPath", () => {
  it("returns only directory names", () => {
    mockReaddirSync.mockReturnValue([
      { name: ".git", isDirectory: (): boolean => true },
      { name: "src", isDirectory: (): boolean => true },
      { name: "file.ts", isDirectory: (): boolean => false },
    ]);

    expect(getDirectoriesNameByPath("/project")).toEqual([".git", "src"]);
  });

  it("returns empty array when no directories exist", () => {
    mockReaddirSync.mockReturnValue([
      { name: "file.ts", isDirectory: (): boolean => false },
    ]);

    expect(getDirectoriesNameByPath("/project")).toEqual([]);
  });

  it("calls readdirSync with correct path and options", () => {
    mockReaddirSync.mockReturnValue([]);

    getDirectoriesNameByPath("/project");

    expect(mockReaddirSync).toHaveBeenCalledWith("/project", {
      withFileTypes: true,
    });
  });
});

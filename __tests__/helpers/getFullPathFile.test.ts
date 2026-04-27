import path from "path";

import { getFullPathFile } from "@/helpers/getFullPathFile";

describe("getFullPathFile", () => {
  it("should join directory and filename into a full path", () => {
    const result = getFullPathFile("/workspace", "src/file.ts");

    expect(result).toBe(path.join("/workspace", "src/file.ts"));
  });

  it("should handle a nested filename", () => {
    const result = getFullPathFile("/home/user/project", "a/b/c.ts");

    expect(result).toBe(path.join("/home/user/project", "a/b/c.ts"));
  });

  it("should handle a simple filename without subdirectory", () => {
    const result = getFullPathFile("/workspace", "main.ts");

    expect(result).toBe(path.join("/workspace", "main.ts"));
  });

  it("should handle empty filename", () => {
    const result = getFullPathFile("/workspace", "");

    expect(result).toBe(path.join("/workspace", ""));
  });

  it("should handle empty directory", () => {
    const result = getFullPathFile("", "file.ts");

    expect(result).toBe(path.join("", "file.ts"));
  });
});

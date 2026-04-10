import path from "path";

import { getFullPathFile } from "@/helpers/getFullPathFile";

describe("getFullPathFile", () => {
  it("joins directory and filename into a full path", () => {
    expect(getFullPathFile("/workspace", "src/file.ts")).toBe(
      path.join("/workspace", "src/file.ts")
    );
  });

  it("handles nested filenames", () => {
    expect(getFullPathFile("/workspace", "nested/dir/file.ts")).toBe(
      path.join("/workspace", "nested/dir/file.ts")
    );
  });
});

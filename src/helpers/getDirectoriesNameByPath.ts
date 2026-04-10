import * as fs from "fs";

export const getDirectoriesNameByPath = (directory: string): string[] => {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((dir) => dir.name);
};

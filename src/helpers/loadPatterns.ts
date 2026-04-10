import * as vscode from "vscode";

import type { CustomPatterns, DefaultPatterns } from "@/types/configuration";
import type { RegexPatterns } from "@/types/app";

import { isValidRegExpFlags } from "@/helpers/isValidRegExpFlags";

export const loadPatterns = (): RegexPatterns => {
  const config = vscode.workspace.getConfiguration("tokenSentry");
  const defaultPatterns = config.get<DefaultPatterns>("defaultPatterns") ?? {};
  const customPatterns = config.get<CustomPatterns>("customPatterns") ?? {};

  const allPatterns = { ...defaultPatterns, ...customPatterns };

  const regexPatterns: RegexPatterns = {};

  for (const [name, { pattern, flags }] of Object.entries(allPatterns)) {
    try {
      const validFlags = flags && isValidRegExpFlags(flags) ? flags : undefined;
      regexPatterns[name] = new RegExp(pattern, validFlags);
    } catch {
      vscode.window.showWarningMessage(
        `TokenSentry: invalid pattern skipped — "${name}".`
      );
    }
  }

  return regexPatterns;
};

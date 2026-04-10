export interface Pattern {
  pattern: string;
  flags?: string;
}

export type DefaultPatterns = Record<string, Pattern>;

export type CustomPatterns = Record<string, Pattern>;

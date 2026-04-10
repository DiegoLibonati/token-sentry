export const isValidRegExpFlags = (flags: string): boolean => {
  return /^[gimsuy]*$/.test(flags) && flags.length === new Set(flags).size;
};

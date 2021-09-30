export const serialize = (obj: unknown): string => {
  return JSON.stringify(obj, null, 2);
};

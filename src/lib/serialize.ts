export const serialize = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

export const encode = (input: string | undefined): string | undefined =>
  input ? Buffer.from(input, 'binary').toString('base64') : undefined;

export const decode = (base64: string | undefined): string | undefined =>
  base64 ? Buffer.from(base64, 'base64').toString('binary') : undefined;

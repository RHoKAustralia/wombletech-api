export const encode = (input: string): string => Buffer.from(input, 'binary').toString('base64');

export const decode = (base64: string): string => Buffer.from(base64, 'base64').toString('binary');

import Hashids from 'hashids';

const hashids = new Hashids('wombletech-rhok');
export const generateIdentifier = (): string => {
  return hashids.encode(new Date().valueOf());
};

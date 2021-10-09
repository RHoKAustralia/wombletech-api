import Hashids from 'hashids';

const hashids = new Hashids('wombletech-rhok');
const baseline = new Date('2020-01-01').valueOf();

export const generateIdentifier = (): string => {
  const data = process.hrtime();
  const now = new Date().valueOf() - baseline;
  const stamp = now * 1000 + (data[1] % 1000);

  return hashids.encode(stamp);
};

import { Isotope, IsotopeResult } from 'isotopes';
import { Item } from '../types/item';

const isotope = new Isotope<Item>({
  domain: 'wombletech',
  key: 'itemId',
});

export const readDonatedItems = async (donationId: string): Promise<IsotopeResult<Item>> => {
  const expr = isotope.getQueryBuilder().where('`donationId` = ?', donationId);
  return await isotope.select(expr);
};

export const insertDonatedItem = async (item: Item): Promise<void> => {
  await isotope.put(item);
};

export const getItem = async (donationId: string, itemId: string): Promise<Item | undefined> => {
  const item = await isotope.get(itemId);
  return item?.donationId === donationId ? item : undefined;
};

export const updateDonatedItem = async (item: Item): Promise<void> => {
  const { donationId, ...remaining } = item;
  await isotope.put(remaining);
};

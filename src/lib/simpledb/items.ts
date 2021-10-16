import { Isotope, IsotopeResult } from 'isotopes';
import { Item } from '../types/item';

const isotope = new Isotope<Item & { comboId: string }>({
  domain: 'wombletech',
  key: 'comboId',
});

export const readDonatedItems = async (donationId: string): Promise<IsotopeResult<Item>> => {
  const expr = isotope.getQueryBuilder().where('`donationId` = ?', donationId);
  const fetched = await isotope.select(expr);
  const items = fetched.items.map((item) => {
    const { comboId, ...remaining } = item;
    return remaining as Item;
  });
  return { items: items };
};

export const insertDonatedItem = async (item: Item): Promise<void> => {
  const insert = { ...item, comboId: `${item.itemId}--${item.donationId}` };
  await isotope.put(insert);
};

export const getItem = async (donationId: string, itemId: string): Promise<Item | undefined> => {
  const fetch = await isotope.get(`${itemId}--${donationId}`);
  const { comboId, ...remaining } = fetch;
  return remaining;
};

export const updateDonatedItem = async (item: Item): Promise<void> => {
  const update = { ...item, comboId: `${item.itemId}--${item.donationId}` };
  await isotope.put(update);
};

export const itemExists = async (donationId: string, itemId: string): Promise<boolean> => {
  const item = await getItem(donationId, itemId);
  return !!item;
};

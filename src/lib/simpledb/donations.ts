import { Isotope, IsotopeResult } from 'isotopes';
import { Donation } from '../types/donation';

const isotope = new Isotope<Donation>({
  domain: 'wombletech',
  key: 'donationId',
});

export const readDonations = async (
  limit?: number,
  ascending?: boolean,
  prev?: string
): Promise<IsotopeResult<Donation>> => {
  const startDate = '2020-01-01';
  const expr = isotope
    .getQueryBuilder()
    .where('`active` = ? and `submitDate` >= ?', true, startDate)
    .order('`submitDate`', ascending ? 'asc' : 'desc')
    .limit(Math.min(limit ?? 10, 50));

  return await isotope.select(expr, prev);
};

export const insertDonation = async (donation: Donation): Promise<void> => {
  donation.submitDate = new Date().toISOString();
  donation.active = true;
  await isotope.put(donation);
};

export const updateDonation = async (donation: Donation): Promise<void> => {
  const { submitDate, ...remaining } = donation;
  await isotope.put(remaining);
};

export const getDonation = (donationId: string): Promise<Donation | undefined> => {
  return isotope.get(donationId);
};

export const donationExists = async (donationId: string): Promise<boolean> => {
  const donation = await getDonation(donationId);
  return !!donation;
};

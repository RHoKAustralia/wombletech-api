import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Donation, DonationSchema } from '../../lib/types/donation';
import { Item, ItemSchema } from '../../lib/types/item';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateDonationBySchema = ajv.compile(DonationSchema);
const validateItemBySchema = ajv.compile(ItemSchema);

export const validateDonation = (donation: Donation): { valid: boolean; errors: unknown } => {
  const valid = validateDonationBySchema(donation);
  return { valid, errors: validateDonationBySchema.errors };
};

export const validateItem = (item: Item): { valid: boolean; errors: unknown } => {
  const valid = validateItemBySchema(item);
  return { valid, errors: validateItemBySchema.errors };
};

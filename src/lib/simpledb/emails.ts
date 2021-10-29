import { Isotope } from '@many-monkeys/isotopes';
import { Email } from '../types/email';

const isotope = new Isotope<Email>({
  domain: 'wombletech',
  key: 'emailId',
  type: 'email',
});

export const insertEmailToUnsortedQueue = async (email: Email): Promise<void> => {
  await attachEmailToDonation('system_unsorted', email);
};

export const attachEmailToDonation = async (donationId: string, email: Email): Promise<void> => {
  email.donationId = donationId;
  await isotope.put(email);
};

import { S3CreateEvent } from 'aws-lambda';
import aws from 'aws-sdk';
import { attachEmailToDonation, insertEmailToUnsortedQueue } from '../../../lib/simpledb/emails';
import { simpleParser, ParsedMail } from 'mailparser';
import { donationExists } from '../../../lib/simpledb/donations';

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const getEmailFromBucket = async (bucket: string, key: string): Promise<ParsedMail> => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  const s3Object = s3.getObject(params);
  const stream = s3Object.createReadStream();

  const parsedEmail = await simpleParser(stream);
  return parsedEmail;
};

const processEmail = async (key: string, parsedEmail: ParsedMail): Promise<void> => {
  const subject = parsedEmail.subject ?? '(unknown subject)';

  const emailDetails = {
    key: key,
    receiptTime: new Date().toISOString(),
    sender: parsedEmail.from?.value[0].address ?? '(unknown sender)',
    subject: subject,
  };

  const matches = subject.match(/\(Ref:(.*)\)/);
  if (matches?.length === 2) {
    const ref = matches[1].trim();
    if (await donationExists(ref)) {
      await attachEmailToDonation(ref, emailDetails);
      return;
    }
  }

  await insertEmailToUnsortedQueue(emailDetails);
};

export const lambdaHandler = async (event: S3CreateEvent): Promise<void> => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    const parsedEmail = await getEmailFromBucket(bucket, key);
    await processEmail(key, parsedEmail);
  } catch (err) {
    console.error(err);
  }
};

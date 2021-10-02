import { S3CreateEvent } from 'aws-lambda';
import aws from 'aws-sdk';
import { insertEmailToUnsortedQueue } from '../../../lib/database/email';
import { simpleParser } from 'mailparser';

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

export const lambdaHandler = async (event: S3CreateEvent): Promise<void> => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    const params = {
      Bucket: bucket,
      Key: key,
    };

    const s3Object = s3.getObject(params);
    const stream = s3Object.createReadStream();

    const parsedEmail = await simpleParser(stream);

    await insertEmailToUnsortedQueue({
      key: key,
      receiptTime: new Date().toISOString(),
      sender: parsedEmail.from?.value[0].address ?? '(unknown sender)',
      subject: parsedEmail.subject ?? '(unknown subject)',
    });
  } catch (err) {
    console.error(err);
  }
};

export interface Email {
  donationId?: string;
  emailId: string;
  s3Key: string;
  sender: string;
  subject: string;
  receiptTime: string;
}

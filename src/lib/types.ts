export interface PimaryKey {
  donationId: string;
  recordType: string;
}

export interface QueryParams {
  limit?: number;
  cursor?: string;
  ascending?: boolean;
}

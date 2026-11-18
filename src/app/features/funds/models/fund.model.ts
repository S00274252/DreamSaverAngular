export type FundType = 'static' | 'interest';

export interface Fund {
  _id: string;
  userId: string;
  name: string;
  type: FundType;
  amount: number;
  interestRate?: number;
  startDate?: string;
  durationMonths?: number;
}

export interface CreateFundDto {
  userId: string;
  name: string;
  type: FundType;
  amount: number;
  interestRate?: number;
  startDate?: string;
  durationMonths?: number;
}

export interface UpdateFundDto {
  name: string;
  type: FundType;
  amount: number;
  interestRate?: number;
  startDate?: string;
  durationMonths?: number;
}

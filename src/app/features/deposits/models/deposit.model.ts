export interface Deposit {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CreateDepositDto {
  userId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface UpdateDepositDto {
  amount: number;
  date: string;
  note?: string;
}

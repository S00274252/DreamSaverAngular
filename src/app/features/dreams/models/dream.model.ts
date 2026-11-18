export interface Dream {
  _id: string;
  userId: string;
  title: string;
  targetAmount: number;
  achieved: boolean;
}

export interface CreateDreamDto {
  userId: string;
  title: string;
  targetAmount: number;
}

export interface UpdateDreamDto {
  title: string;
  targetAmount: number;
  achieved: boolean;
}

export interface DreamEstimate {
  achievable: boolean;
  currentBalance: number;
  targetAmount: number;
  remainingAmount: number;
  monthlyDeposit: number;
  monthsRemaining: number | null;
  daysRemaining: number | null;
  estimatedDate: string | null;
}

export interface Balance {
  asOf: string;
  depositsTotal: number;
  staticFundsTotal: number;
  interestFundsPrincipal: number;
  interestEarned: number;
  interestFundsTotal: number;
  totalBalance: number;
}

export interface Prediction {
  asOf: string;
  predictionDate: string;
  monthlyDeposit: number;
  currentBalance: number;
  predictedBalance: number;
  expectedGrowth: number;
}

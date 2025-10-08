export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercentage: number;
  marketCap: string;
  volume: string;
  avgVolume: string;
  peRatio: number | null;
  dividendYield: number | null;
  isFavorite?: boolean;
  amount?: number;
  isInProfile?: boolean;
}

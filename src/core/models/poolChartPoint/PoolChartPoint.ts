import { Currency } from '../currency/Currency.ts';

export interface PoolChartPoint {
  readonly timestamp: number;
  readonly value: Currency;
}

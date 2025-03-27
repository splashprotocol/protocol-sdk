import { Currency } from '@splashprotocol/core';

export interface PoolChartPoint {
  readonly timestamp: number;
  readonly value: Currency;
}

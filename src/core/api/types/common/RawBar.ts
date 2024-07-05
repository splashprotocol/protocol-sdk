import { lts, price } from '../../../types/types.ts';

export type Resolution =
  | 'min1'
  | 'min5'
  | 'hour1'
  | 'day1'
  | 'week1'
  | 'month1'
  | 'year1';

export interface RawBar {
  readonly time: lts;
  readonly low: price;
  readonly high: price;
  readonly open: price;
  readonly close: price;
  readonly volume: price;
}

import { lts } from '../../../types/types.ts';

export type Resolution =
  | 'min1'
  | 'min5'
  | 'hour1'
  | 'day1'
  | 'week1'
  | 'month1'
  | 'year1';

export interface Bar {
  readonly time: lts;
  readonly low: number;
  readonly high: number;
  readonly open: number;
  readonly close: number;
  readonly volume: number;
}

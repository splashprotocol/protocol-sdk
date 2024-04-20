import { uint } from '../../../types/types.ts';
import { RawTradeOrder } from '../common/RawTradeOrder.ts';

export interface GetTradeOrdersParams {
  readonly limit: number;
  readonly offset: number;
  readonly paymentKeyHashes: string[];
}

export interface GetTradeOrdersResult {
  readonly count: uint;
  readonly orders: RawTradeOrder[];
}

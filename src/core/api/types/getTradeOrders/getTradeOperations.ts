import { uint } from '../../../types/types.ts';
import { RawTradeOrder } from '../common/RawTradeOrder.ts';

export interface getTradeOrdersParams {
  readonly limit: number;
  readonly offset: number;
  readonly paymentKeyHashes: string[];
}

export interface getTradeOrdersResult {
  readonly count: uint;
  readonly orders: RawTradeOrder[];
}

import { uint } from '../../../types/types.ts';
import { RawTradeOrder } from '../common/RawTradeOrder.ts';

export interface GetTradeOpenOrdersParams {
  readonly paymentKeyHashes: string[];
}

export interface GetTradeOpenOrdersResult {
  readonly count: uint;
  readonly orders: RawTradeOrder[];
}

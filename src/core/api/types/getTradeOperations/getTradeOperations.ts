import { uint } from '../../../types/types.ts';
import { RawTradeOperation } from '../common/RawTradeOperation.ts';

export interface GetTradeOperationsParams {
  readonly limit: number;
  readonly offset: number;
  readonly paymentKeyHashes: string[];
}

export interface GetTradeOperationsResponse {
  readonly count: uint;
  readonly orders: RawTradeOperation[];
}

import { RawTradeOperation } from '../common/RawTradeOperation.ts';

export interface GetTradeOperationsParams {
  readonly limit: number;
  readonly offset: number;
  readonly paymentKeyHashes: string[];
}

export interface GetTradeOperationsResponse {
  readonly count: number;
  readonly orders: RawTradeOperation[];
}

import { uint } from '@splashprotocol/core';
import { TradeOrder } from '../../../../../types/TradeOrder.ts';

export interface GetTradeOrdersResult {
  readonly count: uint;
  readonly orders: TradeOrder[];
}

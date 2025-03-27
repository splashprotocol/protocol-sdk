import { uint } from '@splashprotocol/core';
import { AnyLiquidityOrder } from '../../../../../types/AnyLiquidityOrder.ts';

export interface GetLiquidityOrdersResult {
  readonly count: uint;
  readonly orders: AnyLiquidityOrder[];
}

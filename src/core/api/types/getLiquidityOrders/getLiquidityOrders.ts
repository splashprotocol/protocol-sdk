import { uint } from '../../../types/types.ts';
import {
  RawLiquidityDepositOrder,
  RawLiquidityRedeemOrder,
} from '../common/RawLiquidityOrder.ts';

export interface GetLiquidityOrdersParams {
  readonly limit: number;
  readonly offset: number;
  readonly paymentKeyHashes: string[];
}

export interface GetLiquidityOrdersResult {
  readonly count: uint;
  readonly order: (RawLiquidityRedeemOrder | RawLiquidityDepositOrder)[];
}

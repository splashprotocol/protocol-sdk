import {
  RawLiquidityDepositOrder,
  RawLiquidityRedeemOrder,
} from '../common/RawLiquidityOrder.ts';
import { RawTradeOrder } from '../common/RawTradeOrder.ts';

export interface GetOrdersMempoolParams {
  readonly paymentKeyHashes: string[];
}

export type GetOrdersMempoolResult = (
  | RawTradeOrder
  | RawLiquidityDepositOrder
  | RawLiquidityRedeemOrder
)[];

import { DepositLiquidityOrder } from '../../../core/models/liquidityOrder/DepositLiquidityOrder.ts';
import { RedeemLiquidityOrder } from '../../../core/models/liquidityOrder/RedeemLiquidityOrder.ts';
import { TradeOrder } from '../../../core/models/tradeOrder/TradeOrder.ts';

export type SelectMempoolLiquidityOperationsParams = (
  | TradeOrder
  | DepositLiquidityOrder
  | RedeemLiquidityOrder
)[];

export type SelectMempoolLiquidityOperationsResult = (
  | DepositLiquidityOrder
  | RedeemLiquidityOrder
)[];

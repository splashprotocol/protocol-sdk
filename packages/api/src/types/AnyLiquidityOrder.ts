import { RedeemLiquidityOrder } from './RedeemLiquidityOrder.ts';
import { DepositLiquidityOrder } from './DepositLiquidityOrder.ts';

export type AnyLiquidityOrder = RedeemLiquidityOrder | DepositLiquidityOrder;

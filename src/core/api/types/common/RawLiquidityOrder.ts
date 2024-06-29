import {
  AssetId,
  OutputReferenceHash,
  PoolId,
  TransactionHash,
  ts,
} from '../../../types/types.ts';
import { CurrencyDescriptor } from './CurrencyDescriptor.ts';

export type RawLiquidityOrderStatus =
  | 'Pending'
  | 'Evaluated'
  | 'Refunded'
  | 'mempool';

export interface RawLiquidityOrder {
  readonly orderId: OutputReferenceHash;
  readonly poolId: PoolId;
  readonly status: RawLiquidityOrderStatus;
  readonly pendingTxId: TransactionHash;
  readonly pendingTxTimestamp: ts;
  readonly evaluatedTxId?: TransactionHash;
  readonly evaluatedTxTimestamp?: ts;
}

export interface RawLiquidityDepositOrder extends RawLiquidityOrder {
  readonly orderType: 'cfmmDeposit' | 'weightedDeposit' | 'stableDeposit';
  readonly x: CurrencyDescriptor;
  readonly y: CurrencyDescriptor;
  readonly actualX?: string;
  readonly actualY?: string;
  readonly lq?: CurrencyDescriptor;
}

export interface RawLiquidityRedeemOrder extends RawLiquidityOrder {
  readonly orderType: 'cfmmRedeem' | 'weightedRedeem' | 'stableRedeem';
  readonly lq: CurrencyDescriptor;
  readonly yAmount?: string;
  readonly yAsset: AssetId;
  readonly xAmount?: string;
  readonly xAsset: AssetId;
}

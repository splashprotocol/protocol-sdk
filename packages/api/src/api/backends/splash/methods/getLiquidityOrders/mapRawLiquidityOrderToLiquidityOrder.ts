import { RedeemLiquidityOrder } from '../../../../../types/RedeemLiquidityOrder.ts';
import {
  RawLiquidityDepositOrder,
  RawLiquidityRedeemOrder,
} from './RawLiquidityOrder.ts';
import { AssetInfo, AssetInfoMetadata, Currency } from '@splashprotocol/core';
import { DepositLiquidityOrder } from '../../../../../types/DepositLiquidityOrder.ts';

const mapRawLiquidityRedeemOrderToRedeemLiquidityOrder = (
  rawLiquidityRedeemOrder: RawLiquidityRedeemOrder,
  metadataX?: AssetInfoMetadata,
  metadataY?: AssetInfoMetadata,
): RedeemLiquidityOrder => {
  const lqAsset = AssetInfo.fromAssetId(rawLiquidityRedeemOrder.lq.asset);
  const x: Currency = Currency.new(
    BigInt(rawLiquidityRedeemOrder.xAmount || '0'),
    AssetInfo.fromAssetId(rawLiquidityRedeemOrder.xAsset, metadataX),
  );
  const y: Currency = Currency.new(
    BigInt(rawLiquidityRedeemOrder.yAmount || '0'),
    AssetInfo.fromAssetId(rawLiquidityRedeemOrder.yAsset, metadataY),
  );

  return {
    operation: 'redeem',
    type:
      rawLiquidityRedeemOrder.orderType === 'cfmmRedeem' ? 'cfmm' : 'weighted',
    orderOutputReference: rawLiquidityRedeemOrder.orderId,
    lq: Currency.new(BigInt(rawLiquidityRedeemOrder.lq.amount), lqAsset),
    x,
    y,
    orderTxTimestamp: rawLiquidityRedeemOrder.pendingTxTimestamp * 1_000,
    orderTxHash: rawLiquidityRedeemOrder.pendingTxId,
    evaluatedTxTimestamp: rawLiquidityRedeemOrder.evaluatedTxTimestamp
      ? rawLiquidityRedeemOrder.evaluatedTxTimestamp * 1_000
      : undefined,
    evaluatedTxHash: rawLiquidityRedeemOrder.evaluatedTxId,
    status:
      rawLiquidityRedeemOrder.status === 'Refunded'
        ? 'Cancelled'
        : rawLiquidityRedeemOrder.status,
  };
};

const mapRawLiquidityDepositOrderToDepositLiquidityOrder = (
  rawLiquidityDepositOrder: RawLiquidityDepositOrder,
  metadataX?: AssetInfoMetadata,
  metadataY?: AssetInfoMetadata,
): DepositLiquidityOrder => {
  const xAsset = AssetInfo.fromAssetId(
    rawLiquidityDepositOrder.x.asset,
    metadataX,
  );
  const xAmount = rawLiquidityDepositOrder.actualX
    ? BigInt(rawLiquidityDepositOrder.actualX)
    : BigInt(rawLiquidityDepositOrder.x.amount);
  const yAsset = AssetInfo.fromAssetId(
    rawLiquidityDepositOrder.y.asset,
    metadataY,
  );
  const yAmount = rawLiquidityDepositOrder.actualY
    ? BigInt(rawLiquidityDepositOrder.actualY)
    : BigInt(rawLiquidityDepositOrder.y.amount);

  return {
    operation: 'deposit',
    type:
      rawLiquidityDepositOrder.orderType === 'cfmmDeposit'
        ? 'cfmm'
        : 'weighted',
    orderOutputReference: rawLiquidityDepositOrder.orderId,
    x: Currency.new(xAmount, xAsset),
    y: Currency.new(yAmount, yAsset),
    lq: rawLiquidityDepositOrder.lq
      ? Currency.new(
          BigInt(rawLiquidityDepositOrder.lq.amount),
          AssetInfo.fromAssetId(rawLiquidityDepositOrder.lq.asset),
        )
      : undefined,
    orderTxTimestamp: rawLiquidityDepositOrder.pendingTxTimestamp * 1_000,
    orderTxHash: rawLiquidityDepositOrder.pendingTxId,
    evaluatedTxTimestamp: rawLiquidityDepositOrder.evaluatedTxTimestamp
      ? rawLiquidityDepositOrder.evaluatedTxTimestamp * 1_000
      : undefined,
    evaluatedTxHash: rawLiquidityDepositOrder.evaluatedTxId,
    status:
      rawLiquidityDepositOrder.status === 'Refunded'
        ? 'Cancelled'
        : rawLiquidityDepositOrder.status,
  };
};

export interface MapRawLiquidityOrderToLiquidityOrderConfig {
  readonly metadataX?: AssetInfoMetadata;
  readonly metadataY?: AssetInfoMetadata;
  readonly rawLiquidityOrder:
    | RawLiquidityDepositOrder
    | RawLiquidityRedeemOrder;
}
export const mapRawLiquidityOrderToLiquidityOrder = ({
  metadataX,
  metadataY,
  rawLiquidityOrder,
}: MapRawLiquidityOrderToLiquidityOrderConfig):
  | DepositLiquidityOrder
  | RedeemLiquidityOrder => {
  if (
    rawLiquidityOrder.orderType === 'cfmmDeposit' ||
    rawLiquidityOrder.orderType === 'weightedDeposit' ||
    rawLiquidityOrder.orderType === 'stableDeposit'
  ) {
    return mapRawLiquidityDepositOrderToDepositLiquidityOrder(
      rawLiquidityOrder,
      metadataX,
      metadataY,
    );
  }
  if (
    rawLiquidityOrder.orderType === 'cfmmRedeem' ||
    rawLiquidityOrder.orderType === 'weightedRedeem' ||
    rawLiquidityOrder.orderType === 'stableRedeem'
  ) {
    return mapRawLiquidityRedeemOrderToRedeemLiquidityOrder(
      rawLiquidityOrder,
      metadataX,
      metadataY,
    );
  }

  throw new Error('unsupported operation');
};

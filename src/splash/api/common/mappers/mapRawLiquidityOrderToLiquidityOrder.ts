import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import {
  RawLiquidityDepositOrder,
  RawLiquidityRedeemOrder,
} from '../../../../core/api/types/common/RawLiquidityOrder.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { DepositLiquidityOrder } from '../../../../core/models/liquidityOrder/DepositLiquidityOrder.ts';
import { RedeemLiquidityOrder } from '../../../../core/models/liquidityOrder/RedeemLiquidityOrder.ts';
import { Splash } from '../../../splash.ts';

const mapRawLiquidityRedeemOrderToRedeemLiquidityOrder = (
  rawLiquidityRedeemOrder: RawLiquidityRedeemOrder,
  splash: Splash<{}>,
  metadataX?: AssetMetadata,
  metadataY?: AssetMetadata,
): RedeemLiquidityOrder => {
  const [lqPolicyId, lqBase16Name] =
    rawLiquidityRedeemOrder.lq.asset.split('.');
  const lqAsset = AssetInfo.new({
    policyId: lqPolicyId,
    name: lqBase16Name,
    type: 'base16',
  });
  const [xPolicyId, xBase16Name] = rawLiquidityRedeemOrder.xAsset.split('.');
  const x: Currency = Currency.new(
    BigInt(rawLiquidityRedeemOrder.xAmount || '0'),
    AssetInfo.new(
      {
        policyId: xPolicyId,
        name: xBase16Name,
        type: 'base16',
      },
      metadataX,
    ),
  );

  const [yPolicyId, yBase16Name] = rawLiquidityRedeemOrder.yAsset.split('.');
  const y: Currency = Currency.new(
    BigInt(rawLiquidityRedeemOrder.yAmount || '0'),
    AssetInfo.new(
      {
        policyId: yPolicyId,
        name: yBase16Name,
        type: 'base16',
      },
      metadataY,
    ),
  );

  return RedeemLiquidityOrder.new(
    {
      type:
        rawLiquidityRedeemOrder.orderType === 'cfmmRedeem'
          ? 'cfmm'
          : 'weighted',
      orderId: rawLiquidityRedeemOrder.orderId,
      lq: Currency.new(BigInt(rawLiquidityRedeemOrder.lq.amount), lqAsset),
      x,
      y,
      orderTxTimestamp: rawLiquidityRedeemOrder.pendingTxTimestamp * 1_000,
      orderTxId: rawLiquidityRedeemOrder.pendingTxId,
      evaluatedTxTimestamp: rawLiquidityRedeemOrder.evaluatedTxTimestamp
        ? rawLiquidityRedeemOrder.evaluatedTxTimestamp * 1_000
        : undefined,
      evaluatedTxId: rawLiquidityRedeemOrder.evaluatedTxId,
      status:
        rawLiquidityRedeemOrder.status === 'Refunded'
          ? 'Cancelled'
          : rawLiquidityRedeemOrder.status,
    },
    splash,
  );
};

const mapRawLiquidityDepositOrderToDepositLiquidityOrder = (
  rawLiquidityDepositOrder: RawLiquidityDepositOrder,
  splash: Splash<{}>,
  metadataX?: AssetMetadata,
  metadataY?: AssetMetadata,
): DepositLiquidityOrder => {
  const [xPolicyId, xBase16Name] = rawLiquidityDepositOrder.x.asset.split('.');
  const [yPolicyId, yBase16Name] = rawLiquidityDepositOrder.y.asset.split('.');
  const lqInfo = rawLiquidityDepositOrder.lq
    ? rawLiquidityDepositOrder.lq.asset.split('.')
    : undefined;

  const xAsset = AssetInfo.new(
    {
      policyId: xPolicyId,
      name: xBase16Name,
      type: 'base16',
    },
    metadataX,
  );
  const xAmount = rawLiquidityDepositOrder.actualX
    ? BigInt(rawLiquidityDepositOrder.actualX)
    : BigInt(rawLiquidityDepositOrder.x.amount);
  const yAsset = AssetInfo.new(
    {
      policyId: yPolicyId,
      name: yBase16Name,
      type: 'base16',
    },
    metadataY,
  );
  const yAmount = rawLiquidityDepositOrder.actualY
    ? BigInt(rawLiquidityDepositOrder.actualY)
    : BigInt(rawLiquidityDepositOrder.y.amount);

  return DepositLiquidityOrder.new(
    {
      type:
        rawLiquidityDepositOrder.orderType === 'cfmmDeposit'
          ? 'cfmm'
          : 'weighted',
      orderId: rawLiquidityDepositOrder.orderId,
      x: Currency.new(xAmount, xAsset),
      y: Currency.new(yAmount, yAsset),
      lq: lqInfo
        ? Currency.new(
            BigInt(rawLiquidityDepositOrder.lq!.amount),
            AssetInfo.new({
              policyId: lqInfo[0],
              name: lqInfo[1],
              type: 'base16',
            }),
          )
        : undefined,
      orderTxTimestamp: rawLiquidityDepositOrder.pendingTxTimestamp * 1_000,
      orderTxId: rawLiquidityDepositOrder.pendingTxId,
      evaluatedTxTimestamp: rawLiquidityDepositOrder.evaluatedTxTimestamp
        ? rawLiquidityDepositOrder.evaluatedTxTimestamp * 1_000
        : undefined,
      evaluatedTxId: rawLiquidityDepositOrder.evaluatedTxId,
      status:
        rawLiquidityDepositOrder.status === 'Refunded'
          ? 'Cancelled'
          : rawLiquidityDepositOrder.status,
    },
    splash,
  );
};

export interface MapRawLiquidityOrderToLiquidityOrderConfig {
  readonly metadataX?: AssetMetadata;
  readonly metadataY?: AssetMetadata;
  readonly rawLiquidityOrder:
    | RawLiquidityDepositOrder
    | RawLiquidityRedeemOrder;
}
export const mapRawLiquidityOrderToLiquidityOrder = (
  {
    metadataX,
    metadataY,
    rawLiquidityOrder,
  }: MapRawLiquidityOrderToLiquidityOrderConfig,
  splash: Splash<{}>,
): DepositLiquidityOrder | RedeemLiquidityOrder => {
  if (
    rawLiquidityOrder.orderType === 'cfmmDeposit' ||
    rawLiquidityOrder.orderType === 'weightedDeposit' ||
    rawLiquidityOrder.orderType === 'stableDeposit'
  ) {
    return mapRawLiquidityDepositOrderToDepositLiquidityOrder(
      rawLiquidityOrder,
      splash,
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
      splash,
      metadataX,
      metadataY,
    );
  }

  throw new Error('unsupported operation');
};

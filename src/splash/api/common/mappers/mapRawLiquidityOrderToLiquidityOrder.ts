import { AssetMetadata } from '../../../../core/api/types/common/AssetMetadata.ts';
import {
  RawLiquidityDepositOrder,
  RawLiquidityRedeemOrder,
} from '../../../../core/api/types/common/RawLiquidityOrder.ts';
import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { DepositLiquidityOrder } from '../../../../core/models/liquidityOrder/DepositLiquidityOrder.ts';
import { RedeemLiquidityOrder } from '../../../../core/models/liquidityOrder/RedeemLiquidityOrder.ts';
import { Dictionary } from '../../../../core/types/types.ts';
import { Splash } from '../../../splash.ts';

const mapRawLiquidityRedeemOrderToRedeemLiquidityOrder = (
  rawLiquidityRedeemOrder: RawLiquidityRedeemOrder,
  splash: Splash<{}>,
  metadata?: Dictionary<AssetMetadata>,
): RedeemLiquidityOrder => {
  const [lqPolicyId, lqBase16Name] =
    rawLiquidityRedeemOrder.lq.asset.split('.');
  const lqAsset = AssetInfo.new({
    policyId: lqPolicyId,
    name: lqBase16Name,
    type: 'base16',
  });
  const xInfo = rawLiquidityRedeemOrder.x
    ? rawLiquidityRedeemOrder.x.asset.split('.')
    : undefined;
  let x: Currency | undefined;
  if (xInfo) {
    x = Currency.new(
      BigInt(rawLiquidityRedeemOrder.x!.amount),
      AssetInfo.new(
        {
          policyId: xInfo[0],
          name: xInfo[1],
          type: 'base16',
        },
        metadata ? metadata[rawLiquidityRedeemOrder.x!.asset] : undefined,
      ),
    );
  }
  const yInfo = rawLiquidityRedeemOrder.y
    ? rawLiquidityRedeemOrder.y.asset.split('.')
    : undefined;
  let y: Currency | undefined;
  if (yInfo) {
    y = Currency.new(
      BigInt(rawLiquidityRedeemOrder.y!.amount),
      AssetInfo.new(
        {
          policyId: yInfo[0],
          name: yInfo[1],
          type: 'base16',
        },
        metadata ? metadata[rawLiquidityRedeemOrder.y!.asset] : undefined,
      ),
    );
  }

  return RedeemLiquidityOrder.new(
    {
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
  metadata?: Dictionary<AssetMetadata>,
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
    metadata ? metadata[rawLiquidityDepositOrder.x.asset] : undefined,
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
    metadata ? metadata[rawLiquidityDepositOrder.y.asset] : undefined,
  );
  const yAmount = rawLiquidityDepositOrder.actualY
    ? BigInt(rawLiquidityDepositOrder.actualY)
    : BigInt(rawLiquidityDepositOrder.y.amount);

  return DepositLiquidityOrder.new(
    {
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
  readonly metadata?: Dictionary<AssetMetadata>;
  readonly rawLiquidityOrder:
    | RawLiquidityDepositOrder
    | RawLiquidityRedeemOrder;
}
export const mapRawLiquidityOrderToLiquidityOrder = (
  { metadata, rawLiquidityOrder }: MapRawLiquidityOrderToLiquidityOrderConfig,
  splash: Splash<{}>,
): DepositLiquidityOrder | RedeemLiquidityOrder => {
  if (
    rawLiquidityOrder.orderType === 'cfmmDeposit' ||
    rawLiquidityOrder.orderType === 'weightedDeposit'
  ) {
    return mapRawLiquidityDepositOrderToDepositLiquidityOrder(
      rawLiquidityOrder,
      splash,
      metadata,
    );
  }
  if (
    rawLiquidityOrder.orderType === 'cfmmRedeem' ||
    rawLiquidityOrder.orderType === 'weightedRedeem'
  ) {
    return mapRawLiquidityRedeemOrderToRedeemLiquidityOrder(
      rawLiquidityOrder,
      splash,
      metadata,
    );
  }

  throw new Error('unsupported operation');
};

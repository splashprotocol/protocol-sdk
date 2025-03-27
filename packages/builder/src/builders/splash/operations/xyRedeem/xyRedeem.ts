import {
  AssetId,
  CfmmPool,
  Currencies,
  Currency,
  StablePool,
  WeightedPool,
} from '@splashprotocol/core';
import { Operation } from '../../../../core/types/Operation.ts';
import { SplashApiType } from '@splashprotocol/api';
import { Output } from '../../../../core/models/Output/Output.ts';
import { getSplashOperationConfig } from '../common/getSplashOperationConfig.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAda/predictDepositAda.ts';
import { xyRedeemDatum } from './xyRedeemDatum/xyRedeemDatum.ts';
import { credentialsToBech32Address } from '../../../../core/utils/credentialsToBech32Address/credentialsToBech32Address.ts';
import { payToContract } from '../../../../core/operations/payToContract/payToContract.ts';

const MINIMUM_COLLATERAL_ADA = Currency.ada(1_500_000n);
export const OLD_SPLASH_POOLS_NFTS: AssetId[] = [
  '1b6e2890dfcc731b9556bb6a34a1f0c779ac11367603bfd24ee1358e.5351554952545f4144415f4e4654',
  '4400658ab17937e3f59ed318d835dd70180ad6ba46fcf00275f4cd7d.53504c4153485f4144415f4e4654',
];

export const xyRedeem: Operation<
  [CfmmPool | WeightedPool | StablePool, Currency],
  SplashApiType,
  Output
> = (pool, lq) => async (context) => {
  const operationsConfig = await getSplashOperationConfig();
  const executorFeeWithTxFee = MINIMUM_COLLATERAL_ADA;
  const address = context.C.BaseAddress.from_address(
    context.C.Address.from_bech32(context.userAddress),
  );
  const estimatedAssets = pool.convertLpToAssets(lq);
  const redeemScript =
    pool instanceof WeightedPool
      ? OLD_SPLASH_POOLS_NFTS.includes(pool.id)
        ? operationsConfig.operations.redeemWeighted.script
        : operationsConfig.operations.redeemWeightedV2.script
      : pool instanceof StablePool
        ? operationsConfig.operations.redeemStable.script
        : pool.cfmmType === 'feeSwitch'
          ? operationsConfig.operations.redeemFeeSwitch.script
          : operationsConfig.operations.redeemDefault.script;

  const redeemAdaForXYBox = await predictDepositAda(context.pParams, {
    address: context.userAddress,
    value: Currencies.new([estimatedAssets.x, estimatedAssets.y]),
  });
  const outputValue = Currencies.new([
    lq,
    executorFeeWithTxFee,
    redeemAdaForXYBox,
  ]);
  const data = await xyRedeemDatum.serialize({
    nft: {
      policyId: pool.nft.policyId,
      name: pool.nft.nameBase16,
    },
    x: {
      policyId: pool.x.asset.policyId,
      name: pool.x.asset.nameBase16,
    },
    y: {
      policyId: pool.y.asset.policyId,
      name: pool.y.asset.nameBase16,
    },
    lq: {
      policyId: pool.lq.asset.policyId,
      name: pool.lq.asset.nameBase16,
    },
    exFee: executorFeeWithTxFee.amount,
    pkh: address?.payment().as_pub_key()?.to_hex()!,
    skh: address?.stake().as_pub_key()?.to_hex()
      ? address?.stake().as_pub_key()?.to_hex()!
      : {},
  });

  const depositAdaForOrder = Currency.max([
    await predictDepositAda(context.pParams, {
      address: await credentialsToBech32Address('mainnet', {
        hash: redeemScript,
        type: 'script',
      }),
      data: data,
      value: outputValue,
    }),
    MINIMUM_COLLATERAL_ADA,
  ]);

  return payToContract(
    {
      scriptHash: redeemScript,
    },
    outputValue.plus([depositAdaForOrder]),
    data,
  )(context);
};

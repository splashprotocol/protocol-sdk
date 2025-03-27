import {
  CfmmPool,
  Currencies,
  Currency,
  StablePool,
  WeightedPool,
} from '@splashprotocol/core';
import { Operation } from '../../../../core/types/Operation.ts';
import { SplashApiType } from '@splashprotocol/api';
import { Output } from '../../../../core/models/Output/Output.ts';
import { payToContract } from '../../../../core/operations/payToContract/payToContract.ts';
import { credentialsToBech32Address } from '../../../../core/utils/credentialsToBech32Address/credentialsToBech32Address.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAda/predictDepositAda.ts';
import { xyDepositDatum } from './xyDepositDatum/xyDepositDatum.ts';
import { getSplashOperationConfig } from '../common/getSplashOperationConfig.ts';

const MINIMUM_COLLATERAL_ADA = Currency.ada(1_500_000n);

export const xyDeposit: Operation<
  [CfmmPool | WeightedPool | StablePool, [Currency, Currency]],
  SplashApiType,
  Output
> =
  (pool, [x, y]) =>
  async (context) => {
    const operationsConfig = await getSplashOperationConfig();
    const executorFeeWithTxFee = MINIMUM_COLLATERAL_ADA;
    const address = context.C.BaseAddress.from_address(
      context.C.Address.from_bech32(context.userAddress),
    );
    const estimatedLq = pool.convertAssetsToLp({
      x,
      y,
    });
    const depositScript =
      pool instanceof WeightedPool
        ? operationsConfig.operations.depositWeighted.script
        : pool instanceof StablePool
          ? operationsConfig.operations.depositStable.script
          : pool.cfmmType === 'feeSwitch'
            ? operationsConfig.operations.depositFeeSwitch.script
            : operationsConfig.operations.depositDefault.script;
    const depositAdaForLqBox = Currency.max([
      (
        await Output.new(context.pParams, {
          address: context.userAddress,
          value: Currencies.new([estimatedLq, x, y]),
        })
      ).minAdaRequired,
      MINIMUM_COLLATERAL_ADA,
    ]);

    const outputValue = Currencies.new([
      x,
      y,
      executorFeeWithTxFee,
      depositAdaForLqBox,
    ]);
    const tmpData = await xyDepositDatum.serialize({
      nft: {
        policyId: pool.nft.policyId,
        name: pool.nft.nameBase16,
      },
      x: {
        policyId: x.asset.policyId,
        name: x.asset.nameBase16,
      },
      y: {
        policyId: y.asset.policyId,
        name: y.asset.nameBase16,
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
      collateralAda: depositAdaForLqBox.amount,
    });

    const depositAdaForOrder = await predictDepositAda(context.pParams, {
      address: await credentialsToBech32Address(context.network, {
        hash: depositScript,
        type: 'script',
      }),
      data: tmpData,
      value: outputValue,
    });

    const data = await xyDepositDatum.serialize({
      nft: {
        policyId: pool.nft.policyId,
        name: pool.nft.nameBase16,
      },
      x: {
        policyId: x.asset.policyId,
        name: x.asset.nameBase16,
      },
      y: {
        policyId: y.asset.policyId,
        name: y.asset.nameBase16,
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
      collateralAda: depositAdaForLqBox.plus(depositAdaForOrder).amount,
    });

    return payToContract(
      {
        scriptHash: depositScript,
      },
      outputValue.plus([depositAdaForOrder]),
      data,
    )(context);
  };

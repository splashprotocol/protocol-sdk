import { UTxO } from '../../../../../core/models/UTxO/UTxO.ts';
import {
  CalculateInitialBuyOutputParams,
  calculateInitialBuyOutputValue,
} from './calculateInitialBuyOutputValue/calculateInitialBuyOutputValue.ts';
import { Output } from '../../../../../core/models/Output/Output.ts';
import { OperationContext } from '../../../../../core/types/Operation.ts';
import { SplashApiType } from '@splashprotocol/api';
import { Currencies, Currency } from '@splashprotocol/core';
import { ORDER_ADDITIONAL_DATA_KEY } from '../../spotOrder/spotOrder.ts';
import { spotOrderDatum } from '../../spotOrder/spotOrderDatum/spotOrderDatum.ts';
import { getSplashOperationConfig } from '../../common/getSplashOperationConfig.ts';
import { getMinMarginalOutput } from '../../spotOrder/getMinMarginalOutput/getMinMarginalOutput.ts';
import {
  DEFAULT_BATCHER_KEY,
  MINIMUM_COLLATERAL_ADA,
} from '../../spotOrder/constants.ts';
import { InferDatum } from '../../../../../core/models/Datum/Datum.ts';
import { spotOrderBeacon } from '../../spotOrder/spotOrderBeacon/spotOrderBeacon.ts';
import { predictDepositAda } from '../../../../../core/utils/predictDepositAda/predictDepositAda.ts';
import { credentialsToBech32Address } from '../../../../../core/utils/credentialsToBech32Address/credentialsToBech32Address.ts';
import { payToContract } from '../../../../../core/operations/payToContract/payToContract.ts';
import { getBasePrice } from './getBasePrice/getBasePrice.ts';

export interface CreateInitialBuyOutputParams
  extends CalculateInitialBuyOutputParams {
  readonly uTxO: UTxO;
  readonly orderIndex: bigint;
}

export const createInitialBuyOutput = async (
  params: CreateInitialBuyOutputParams,
  context: OperationContext<SplashApiType>,
): Promise<Output> => {
  const operationsConfig = await getSplashOperationConfig();
  const output = calculateInitialBuyOutputValue(params);
  const executorFee = Currency.ada(
    BigInt(operationsConfig.operations.spotOrderV3.settings.executorFee || 0n),
  );
  const worstOrderStepCost = Currency.ada(
    BigInt(operationsConfig.operations.spotOrderV3.settings.worstOrderStepCost),
  );
  const orderMaxStepCount = 1n;

  const basePrice = getBasePrice({
    output,
    input: params.input,
    slippage: 5,
  });
  const minMarginalOutput = await getMinMarginalOutput({
    basePrice,
    input: params.input,
    stepCount: orderMaxStepCount,
    outputAsset: output.asset,
  });
  const address = context.C.Address.from_bech32(context.userAddress);
  const activeBatcherKey = DEFAULT_BATCHER_KEY;
  const userPaymentCredentials = address.payment_cred()!.as_pub_key()!.to_hex();
  const userStakeCredentials = address.staking_cred()?.as_pub_key()?.to_hex();
  const orderIndex = BigInt(params.orderIndex);
  const partialDatumObject: Omit<
    InferDatum<typeof spotOrderDatum>,
    'beacon'
  > = {
    type: '00',
    inputAsset: {
      policyId: params.input.asset.policyId,
      name: params.input.asset.nameBase16,
    },
    inputAmount: params.input.amount,
    costPerExStep: worstOrderStepCost.amount,
    minMarginalOutput: minMarginalOutput.amount,
    outputAsset: {
      policyId: output.asset.policyId,
      name: output.asset.nameBase16,
    },
    price: basePrice.rational,
    executorFee: executorFee.amount,
    address: {
      paymentCredentials: {
        paymentKeyHash: userPaymentCredentials,
      },
      stakeCredentials: userStakeCredentials
        ? {
            paymentKeyHash: userStakeCredentials,
          }
        : {},
    },
    cancelPkh: userPaymentCredentials,
    permittedExecutors: [activeBatcherKey],
  };
  const beacon = await spotOrderBeacon({
    outputReference: params.uTxO.ref,
    orderIndex,
    datumObject: partialDatumObject,
  });
  const data = await spotOrderDatum.serialize({
    ...partialDatumObject,
    beacon: beacon,
  });

  const depositAdaForReceive = await predictDepositAda(context.pParams, {
    value: Currencies.new([output]),
    address: context.userAddress,
  });

  const outputValue = Currencies.new([
    params.input,
    worstOrderStepCost,
    depositAdaForReceive,
    executorFee,
  ]);
  const depositAdaForOrder = await predictDepositAda(context.pParams, {
    value: outputValue,
    data,
    address: await credentialsToBech32Address(
      context.network,
      {
        hash: operationsConfig.operations.spotOrderV3.script,
        type: 'script',
      },
      userStakeCredentials
        ? {
            hash: userStakeCredentials,
            type: 'pubKey',
          }
        : undefined,
    ),
  });

  // additional ada for cover min operation collateral. (1_500_000 lovelace)
  const additionalDepositAda = depositAdaForOrder
    .plus(depositAdaForReceive)
    .gt(MINIMUM_COLLATERAL_ADA)
    ? Currency.ada(0n)
    : MINIMUM_COLLATERAL_ADA.minus(depositAdaForOrder).minus(
        depositAdaForReceive,
      );

  context.transactionCandidate.addAdditionalData(ORDER_ADDITIONAL_DATA_KEY, {
    price: basePrice.rational,
    priceQuote: basePrice.quote.assetId,
    priceBase: basePrice.base.assetId,
    input: params.input,
    output: output,
    address: context.userAddress,
    beacon,
  });
  console.log('pure output', output);
  return payToContract(
    {
      scriptHash: operationsConfig.operations.spotOrderV3.script,
      stakeCredentials: userStakeCredentials
        ? {
            type: 'pubKey',
            hash: userStakeCredentials,
          }
        : undefined,
    },
    outputValue.plus([depositAdaForOrder, additionalDepositAda]),
    data,
  )(context);
};

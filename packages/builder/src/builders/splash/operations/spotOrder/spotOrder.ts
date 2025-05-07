import {
  AssetInfo,
  Currencies,
  Currency,
  HexString,
  Price,
} from '@splashprotocol/core';
import { Operation } from '../../../../core/types/Operation.ts';
import { SplashApiType } from '@splashprotocol/api';
import { Output } from '../../../../core/models/Output/Output.ts';
import { payToContract } from '../../../../core/operations/payToContract/payToContract.ts';
import { getSplashOperationConfig } from '../common/getSplashOperationConfig.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAda/predictDepositAda.ts';
import { credentialsToBech32Address } from '../../../../core/utils/credentialsToBech32Address/credentialsToBech32Address.ts';
import { spotOrderBeacon } from './spotOrderBeacon/spotOrderBeacon.ts';
import {
  SpotOrderDatum,
  spotOrderDatum,
} from './spotOrderDatum/spotOrderDatum.ts';
import { getBasePrice } from './getBasePrice/getBasePrice.ts';
import { getMinMarginalOutput } from './getMinMarginalOutput/getMinMarginalOutput.ts';
import { DEFAULT_BATCHER_KEY, MINIMUM_COLLATERAL_ADA } from './constants.ts';
import { getExecutorFee } from './getExecutorFee/getExecutorFee.ts';

export interface SpotOrderConfig {
  readonly input: Currency;
  readonly outputAsset: AssetInfo;
  readonly price?: Price;
  readonly maxStepCount?: bigint;
  readonly slippage?: number;
  readonly batcherPkh?: HexString;
}

export const ORDER_ADDITIONAL_DATA_KEY = 'orderData';

export const spotOrder: Operation<[SpotOrderConfig], SplashApiType, Output> =
  ({ price, input, outputAsset, slippage, batcherPkh }) =>
  async (context) => {
    const operationsConfig = await getSplashOperationConfig();
    const orderStepCost = Currency.ada(
      BigInt(operationsConfig.operations.spotOrderV3.settings.orderStepCost),
    );
    const executorFeeFromTable = await getExecutorFee(
      context.network === 'mainnet' ? 'mainnet' : 'staging',
      input,
      outputAsset,
    );
    const executorFee = Currency.ada(
      BigInt(
        executorFeeFromTable !== undefined
          ? executorFeeFromTable
          : operationsConfig.operations.spotOrderV3.settings.executorFee || 0n,
      ),
    );

    const worstOrderStepCost = Currency.ada(
      BigInt(
        operationsConfig.operations.spotOrderV3.settings.worstOrderStepCost,
      ),
    );
    const orderMaxStepCount = BigInt(
      price
        ? operationsConfig.operations.spotOrderV3.settings.maxStepCount
        : operationsConfig.operations.spotOrderV3.settings.maxStepCountMarket,
    );

    const basePrice = await getBasePrice(
      {
        price,
        outputAsset,
        input,
        slippage:
          slippage !== undefined
            ? slippage
            : operationsConfig.operations.spotOrderV3.settings
                .marketOrderPriceSlippage,
      },
      context.api,
    );
    const minMarginalOutput = await getMinMarginalOutput({
      basePrice,
      input: input,
      stepCount: orderMaxStepCount,
      outputAsset: outputAsset,
    });
    const [firstUTxO] = context.uTxOsSelector.select(Currencies.new([input]));
    const address = context.C.Address.from_bech32(context.userAddress);
    const activeBatcherKey = batcherPkh || DEFAULT_BATCHER_KEY;
    const userPaymentCredentials = address
      .payment_cred()!
      .as_pub_key()!
      .to_hex();
    const userStakeCredentials = address.staking_cred()?.as_pub_key()?.to_hex();
    const orderIndex = BigInt(context.transactionCandidate.outputs.length);
    const partialDatumObject: Omit<SpotOrderDatum, 'beacon'> = {
      type: '00',
      inputAsset: {
        policyId: input.asset.policyId,
        name: input.asset.nameBase16,
      },
      inputAmount: input.amount,
      costPerExStep: worstOrderStepCost.amount,
      minMarginalOutput: minMarginalOutput.amount,
      outputAsset: {
        policyId: outputAsset.policyId,
        name: outputAsset.nameBase16,
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
      outputReference: firstUTxO.ref,
      orderIndex,
      datumObject: partialDatumObject,
    });
    const data = await spotOrderDatum.serialize({
      ...partialDatumObject,
      beacon: beacon,
    });

    const depositAdaForReceive = await predictDepositAda(context.pParams, {
      value: Currencies.new([basePrice.getNecessaryQuoteFor(input)]),
      address: context.userAddress,
    });

    const outputValue = Currencies.new([
      input,
      worstOrderStepCost,
      orderStepCost.multiply(Number(orderMaxStepCount - 1n)),
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

    context.transactionCandidate.addInput(firstUTxO);
    context.transactionCandidate.addAdditionalData(ORDER_ADDITIONAL_DATA_KEY, {
      price: basePrice.rational,
      priceQuote: basePrice.quote.assetId,
      priceBase: basePrice.base.assetId,
      input,
      output: basePrice.getNecessaryQuoteFor(input),
      address: context.userAddress,
      beacon,
    });
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

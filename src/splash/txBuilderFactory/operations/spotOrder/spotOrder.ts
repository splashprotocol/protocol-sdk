import { Address, NetworkId } from '@dcspark/cardano-multiplatform-lib-browser';
import { blake2b } from 'hash-wasm';
import { encoder } from 'js-encoding-utils';

import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { UTxO } from '../../../../core/models/utxo/UTxO.ts';
import { Splash } from '../../../splash.ts';
import { Operation } from '../common/Operation';
import { payToContract } from '../payToContract/payToContract.ts';
import stringToArrayBuffer = encoder.stringToArrayBuffer;
import { EXECUTOR_FEE } from '../../../../core/utils/executorFee/executorFee.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAdaForExecutor/predictDepositAda.ts';
import { toContractAddress } from '../../../../core/utils/toContractAddress/toContractAddress.ts';

export const createSpotOrderData = (networkId: NetworkId) =>
  Data.Tuple([
    // tag:
    Data.Bytes,
    // beacon: used to track progress.
    Data.Bytes,
    // input: What we submit
    Data.AssetInfo,
    // tradable input: input amount
    Data.BigInt,
    // cost per ex step: Assumed cost (in Lovelace) of one step of execution.
    Data.BigInt,
    // minMarginalOutput: Minimal received output amount allowed per execution step.
    Data.BigInt,
    // output: What we receive
    Data.AssetInfo,
    // base_price: Worst acceptable price (Output/Input)
    Data.Rational,
    // fee: How much fee we pay to executor for whole swap
    Data.BigInt,
    // redeemer_address: where the output from the order must go.
    Data.Address(networkId),
    // PKH authorized to cancel order.
    Data.Bytes,
    // Executors permitted to execute this order.
    Data.List(Data.Bytes),
  ]);

interface GetBasePriceConfig {
  readonly input: Currency;
  readonly outputAsset: AssetInfo;
  readonly price: Price | undefined;
  readonly slippage: number;
}
const getBasePrice = async (
  { price, input, outputAsset, slippage }: GetBasePriceConfig,
  splash: Splash<{}>,
): Promise<Price> => {
  let basePrice: Price;

  if (price) {
    basePrice = price;
  } else {
    basePrice = splash.utils
      .selectEstimatedPrice({
        orderBook: await splash.api.getOrderBook({
          base: input.asset,
          quote: outputAsset,
        }),
        input,
      })
      .priceFromPct(100 + slippage);
  }

  return basePrice.base.isEquals(input.asset) ? basePrice : basePrice.invert();
};

const getBeacon = async (uTxO: UTxO): Promise<string> =>
  blake2b(
    Uint8Array.from([
      ...stringToArrayBuffer(uTxO.ref.txHash),
      ...stringToArrayBuffer(uTxO.ref.index.toString()),
    ]),
    224,
  );

interface getMarginalOutputConfig {
  readonly basePrice: Price;
  readonly inputAsset: AssetInfo;
  readonly outputAsset: AssetInfo;
  readonly orderStepCost: Currency;
}
const getMarginalOutput = async (
  {
    outputAsset,
    inputAsset,
    basePrice,
    orderStepCost,
  }: getMarginalOutputConfig,
  splash: Splash<{}>,
): Promise<Currency> => {
  if (outputAsset.isAda()) {
    return orderStepCost;
  }
  if (inputAsset.isAda()) {
    return basePrice.getNecessaryQuoteFor(orderStepCost);
  }
  const rates = splash.utils.selectRates({
    pairs: await splash.api.getPairs(),
    adaUsdPrice: Price.new({
      base: AssetInfo.ada,
      quote: AssetInfo.usd,
      raw: 0,
    }),
  });

  const outputAdaRate = rates.getPrice(outputAsset);
  if (outputAdaRate) {
    return outputAdaRate.getReceivedBaseFor(orderStepCost);
  }
  const inputAdaRate = rates.getPrice(inputAsset);
  if (inputAdaRate) {
    // TODO: CHECK IT ONE MORE TIME
    return inputAdaRate.cross(basePrice).getReceivedBaseFor(orderStepCost);
  }
  return Currency.new(0n, outputAsset);
};

export interface SpotOrderConfig {
  readonly input: Currency;
  readonly outputAsset: AssetInfo;
  readonly price?: Price;
  readonly maxStepCount?: bigint;
}

export const spotOrder: Operation<[SpotOrderConfig]> =
  ({ price, input, outputAsset }) =>
  async (context) => {
    const orderStepCost = Currency.ada(
      BigInt(
        context.operationsConfig.operations.spotOrder.settings.orderStepCost,
      ),
    );
    const orderMaxStepCount = BigInt(
      context.operationsConfig.operations.spotOrder.settings.maxStepCount,
    );

    const basePrice = await getBasePrice(
      {
        price,
        outputAsset,
        input,
        slippage:
          context.operationsConfig.operations.spotOrder.settings
            .marketOrderPriceSlippage,
      },
      context.splash,
    );
    const minMarginalOutput = await getMarginalOutput(
      {
        basePrice,
        inputAsset: input.asset,
        outputAsset: outputAsset,
        orderStepCost,
      },
      context.splash,
    );
    const [firstUTxO] = context.uTxOsSelector.select(Currencies.new([input]));
    const address = Address.from_bech32(context.userAddress);
    const data = createSpotOrderData(
      context.network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet(),
    )([
      '00',
      await getBeacon(firstUTxO),
      input.asset,
      input.amount,
      orderStepCost.amount,
      minMarginalOutput.amount,
      outputAsset,
      basePrice.raw,
      EXECUTOR_FEE.amount,
      context.userAddress,
      address.payment_cred()!.as_pub_key()!.to_hex(),
      [],
    ]);
    const depositAdaForReceive = predictDepositAda(context.pParams, {
      value: Currencies.new([basePrice.getNecessaryQuoteFor(input)]),
      address: context.userAddress,
    });

    const outputValue = Currencies.new([
      input,
      orderStepCost.multiply(orderMaxStepCount),
      EXECUTOR_FEE,
      depositAdaForReceive,
    ]);
    const depositAdaForOrder = predictDepositAda(context.pParams, {
      value: outputValue,
      data,
      address: toContractAddress(
        context.network === 'mainnet'
          ? NetworkId.mainnet()
          : NetworkId.testnet(),
        context.operationsConfig.operations.spotOrder.script,
        address.staking_cred()?.as_pub_key()?.to_hex(),
      ),
    });

    context.transactionCandidate.addInput(firstUTxO);
    return payToContract(
      {
        script: context.operationsConfig.operations.spotOrder.script,
        version: 'plutusV2',
      },
      outputValue.plus([depositAdaForOrder]),
      data,
      {
        stakeKeyHash: address.staking_cred()?.as_pub_key()?.to_hex(),
      },
    )(context);
  };

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
import { predictDepositAdaForExecutor } from '../../../../core/utils/predictDepositAdaForExecutor/predictDepositAdaForExecutor.ts';

const createSpotOrderData = (networkId: NetworkId) =>
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
  readonly inputAsset: AssetInfo;
  readonly outputAsset: AssetInfo;
  readonly price: Price | undefined;
}
const getBasePrice = async (
  { price, inputAsset, outputAsset }: GetBasePriceConfig,
  splash: Splash<{}>,
): Promise<Price> => {
  let basePrice: Price;

  if (price) {
    basePrice = price;
  } else {
    basePrice = (
      await splash.api.getOrderBook({
        base: inputAsset,
        quote: outputAsset,
      })
    ).spotPrice;
  }

  return basePrice.quote.splashId === inputAsset.splashId
    ? basePrice
    : basePrice.invert();
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
}
const getMarginalOutput = async (
  { outputAsset, inputAsset, basePrice }: getMarginalOutputConfig,
  splash: Splash<{}>,
): Promise<Currency> => {
  if (outputAsset.isAda()) {
    return ORDER_STEP_COST;
  }
  if (inputAsset.isAda()) {
    return basePrice.getReceivedBaseFor(ORDER_STEP_COST);
  }
  const pairs = await splash.api.getPairs();

  const adaOutputPair = pairs.find((pair) =>
    pair.includesSpecifiedAssets([outputAsset, AssetInfo.ada]),
  );
  if (adaOutputPair) {
    return adaOutputPair.spotPrice.getReceivedBaseFor(ORDER_STEP_COST);
  }

  const adaInputPair = pairs.find((pair) =>
    pair.includesSpecifiedAssets([inputAsset, AssetInfo.ada]),
  );
  if (adaInputPair) {
    return adaInputPair.spotPrice
      .cross(basePrice)
      .getReceivedBaseFor(ORDER_STEP_COST);
  }
  return Currency.new(0n, outputAsset);
};

export interface SpotOrderConfig {
  readonly input: Currency;
  readonly outputAsset: AssetInfo;
  readonly price?: Price;
  readonly maxStepCount?: bigint;
}

export const ORDER_STEP_COST = Currency.ada(500_000n);

export const ORDER_EXECUTION_FEE = Currency.ada(500_000n);

export const DEFAULT_MAX_STEP_COUNT = 4n;

export const spotOrder: Operation<[SpotOrderConfig]> =
  ({ price, input, outputAsset, maxStepCount = DEFAULT_MAX_STEP_COUNT }) =>
  async (context) => {
    const basePrice = await getBasePrice(
      {
        price,
        outputAsset,
        inputAsset: input.asset,
      },
      context.splash,
    );
    const minMarginalOutput = await getMarginalOutput(
      {
        basePrice,
        inputAsset: input.asset,
        outputAsset: outputAsset,
      },
      context.splash,
    );
    const depositAda = predictDepositAdaForExecutor(context.pParams, {
      value: Currencies.new([basePrice.getReceivedBaseFor(input)]),
      address: context.userAddress,
    });

    const address = Address.from_bech32(context.userAddress);
    const outputCurrencies = Currencies.new([
      input,
      ORDER_STEP_COST.multiply(maxStepCount),
      ORDER_EXECUTION_FEE,
      depositAda,
    ]);
    const [firstUTxO] = context.uTxOsSelector.select(Currencies.new([input]));

    const data = createSpotOrderData(
      context.network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet(),
    )([
      '00',
      await getBeacon(firstUTxO),
      input.asset,
      input.amount,
      ORDER_STEP_COST.amount,
      minMarginalOutput.amount,
      outputAsset,
      basePrice.raw,
      ORDER_EXECUTION_FEE.amount,
      context.userAddress,
      address.payment_cred()!.as_pub_key()!.to_hex(),
      [],
    ]);

    context.transactionCandidate.addInput(firstUTxO);
    return payToContract(
      {
        script: 'dfaa80c9732ed3b7752ba189786723c6709e2876a024f8f4d9910fb3',
        version: 'plutusV2',
      },
      outputCurrencies,
      data,
    )(context);
  };

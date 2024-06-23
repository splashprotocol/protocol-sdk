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
import { math } from '../../../../core/utils/math/math.ts';
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
  readonly input: Currency;
  readonly stepCount: bigint;
  readonly outputAsset: AssetInfo;
}
const getMarginalOutput = async ({
  input,
  basePrice,
  stepCount,
  outputAsset,
}: getMarginalOutputConfig): Promise<Currency> => {
  return Currency.new(
    BigInt(
      Math.floor(
        math
          .evaluate(
            `${basePrice.getNecessaryQuoteFor(input).amount} / ${stepCount}`,
          )
          .toFixed(),
      ),
    ),
    outputAsset,
  );

  // if (outputAsset.isAda()) {
  //   return orderStepCost;
  // }
  // if (inputAsset.isAda()) {
  //   return basePrice.getNecessaryQuoteFor(orderStepCost);
  // }
  // const rates = splash.utils.selectRates({
  //   pairs: await splash.api.getPairs(),
  //   adaUsdPrice: Price.new({
  //     base: AssetInfo.ada,
  //     quote: AssetInfo.usd,
  //     raw: 0,
  //   }),
  // });
  //
  // const outputAdaRate = rates.getPrice(outputAsset);
  // if (outputAdaRate) {
  //   return outputAdaRate.getReceivedBaseFor(orderStepCost);
  // }
  // const inputAdaRate = rates.getPrice(inputAsset);
  // if (inputAdaRate) {
  //   // TODO: CHECK IT ONE MORE TIME
  //   return inputAdaRate.cross(basePrice).getReceivedBaseFor(orderStepCost);
  // }
  // return Currency.new(0n, outputAsset);
};

export interface SpotOrderConfig {
  readonly input: Currency;
  readonly outputAsset: AssetInfo;
  readonly price?: Price;
  readonly maxStepCount?: bigint;
  readonly slippage?: number;
}

const MINIMUM_COLLATERAL_ADA = Currency.ada(1_500_000n);

export const spotOrder: Operation<[SpotOrderConfig]> =
  ({ price, input, outputAsset, slippage }) =>
  async (context) => {
    const orderStepCost = Currency.ada(
      BigInt(
        context.operationsConfig.operations.spotOrder.settings.orderStepCost,
      ),
    );
    const worstOrderStepCost = Currency.ada(
      BigInt(
        context.operationsConfig.operations.spotOrder.settings
          .worstOrderStepCost,
      ),
    );
    const orderMaxStepCount = BigInt(
      price
        ? context.operationsConfig.operations.spotOrder.settings.maxStepCount
        : context.operationsConfig.operations.spotOrder.settings
            .maxStepCountMarket,
    );

    const basePrice = await getBasePrice(
      {
        price,
        outputAsset,
        input,
        slippage:
          slippage !== undefined
            ? slippage
            : context.operationsConfig.operations.spotOrder.settings
                .marketOrderPriceSlippage,
      },
      context.splash,
    );
    const minMarginalOutput = await getMarginalOutput({
      basePrice,
      input: input,
      stepCount: orderMaxStepCount,
      outputAsset: outputAsset,
    });
    const [firstUTxO] = context.uTxOsSelector.select(Currencies.new([input]));
    const address = Address.from_bech32(context.userAddress);
    const data = createSpotOrderData(
      context.network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet(),
    )([
      '00',
      await getBeacon(firstUTxO),
      input.asset,
      input.amount,
      worstOrderStepCost.amount,
      minMarginalOutput.amount,
      outputAsset,
      Number(
        math
          .evaluate(
            `${basePrice.raw} * 10^${
              basePrice.quote.decimals - basePrice.base.decimals
            }`,
          )
          .toFixed(),
      ),
      0n,
      context.userAddress,
      address.payment_cred()!.as_pub_key()!.to_hex(),
      ['2f9ff04d8914bf64d671a03d34ab7937eb417831ea6b9f7fbcab96f5'],
    ]);
    const depositAdaForReceive = predictDepositAda(context.pParams, {
      value: Currencies.new([basePrice.getNecessaryQuoteFor(input)]),
      address: context.userAddress,
    });

    const outputValue = Currencies.new([
      input,
      worstOrderStepCost,
      orderStepCost.multiply(orderMaxStepCount - 1n),
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

    // additional ada for cover min operation collateral. (1_500_000 lovelace)
    const additionalDepositAda = depositAdaForOrder
      .plus(depositAdaForReceive)
      .gt(MINIMUM_COLLATERAL_ADA)
      ? Currency.ada(0n)
      : MINIMUM_COLLATERAL_ADA.minus(depositAdaForOrder).minus(
          depositAdaForReceive,
        );

    context.transactionCandidate.addInput(firstUTxO);
    return payToContract(
      {
        script: context.operationsConfig.operations.spotOrder.script,
        version: 'plutusV2',
      },
      outputValue.plus([depositAdaForOrder, additionalDepositAda]),
      data,
      {
        stakeKeyHash: address.staking_cred()?.as_pub_key()?.to_hex(),
      },
    )(context);
  };

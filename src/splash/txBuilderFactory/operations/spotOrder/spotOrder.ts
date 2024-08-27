import {
  Address,
  NetworkId,
  TransactionHash,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { blake2b } from 'hash-wasm';
import { Uint64BE } from 'int64-buffer';

import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { Price } from '../../../../core/models/price/Price.ts';
import { UTxO } from '../../../../core/models/utxo/UTxO.ts';
import { HexString } from '../../../../core/types/types.ts';
import { math } from '../../../../core/utils/math/math.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAdaForExecutor/predictDepositAda.ts';
import { toContractAddress } from '../../../../core/utils/toContractAddress/toContractAddress.ts';
import { Splash } from '../../../splash.ts';
import { Operation } from '../common/Operation';
import { payToContract } from '../payToContract/payToContract.ts';

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

export const getBeacon = async (uTxO: UTxO): Promise<string> => {
  return blake2b(
    Uint8Array.from([
      ...TransactionHash.from_hex(uTxO.ref.txHash).to_raw_bytes(),
      ...new Uint64BE(Number(uTxO.ref.index)).toArray(),
      ...new Uint64BE(0).toArray(),
    ]),
    224,
  );
};

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
};

export interface SpotOrderConfig {
  readonly input: Currency;
  readonly outputAsset: AssetInfo;
  readonly price?: Price;
  readonly maxStepCount?: bigint;
  readonly slippage?: number;
  readonly batcherPkh?: HexString;
}

const MINIMUM_COLLATERAL_ADA = Currency.ada(1_500_000n);

export const spotOrder: Operation<[SpotOrderConfig]> =
  ({ price, input, outputAsset, slippage, batcherPkh }) =>
  async (context) => {
    const orderStepCost = Currency.ada(
      BigInt(
        context.operationsConfig.operations.spotOrderV3.settingsV2
          .orderStepCost,
      ),
    );
    const worstOrderStepCost = Currency.ada(
      BigInt(
        context.operationsConfig.operations.spotOrderV3.settingsV2
          .worstOrderStepCost,
      ),
    );
    const orderMaxStepCount = BigInt(
      price
        ? context.operationsConfig.operations.spotOrderV3.settingsV2
            .maxStepCount
        : context.operationsConfig.operations.spotOrderV3.settingsV2
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
            : context.operationsConfig.operations.spotOrderV3.settingsV2
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
      basePrice.raw,
      0n,
      context.userAddress,
      address.payment_cred()!.as_pub_key()!.to_hex(),
      [
        batcherPkh ||
          '5cb2c968e5d1c7197a6ce7615967310a375545d9bc65063a964335b2',
      ],
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
        context.operationsConfig.operations.spotOrderV3.script,
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
        script: context.operationsConfig.operations.spotOrderV3.script,
        version: 'plutusV2',
      },
      outputValue.plus([depositAdaForOrder, additionalDepositAda]),
      data,
      {
        stakeKeyHash: address.staking_cred()?.as_pub_key()?.to_hex(),
      },
    )(context);
  };

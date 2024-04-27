import { NetworkId } from '@dcspark/cardano-multiplatform-lib-browser';

import {
  Bech32String,
  CborHexString,
  HexString,
  OutputReference,
  percent,
  uint,
} from './types.ts';

export interface SplashRefundData {
  readonly cost: {
    readonly mem: uint;
    readonly steps: uint;
  };
  readonly refUtxo: {
    readonly mainnet: OutputReference;
    readonly preprod: OutputReference;
  };
  readonly plutusV2ScriptCbor: CborHexString;
  readonly redeemer: string;
}

export interface SplashOperation {
  readonly script: string;
  readonly refundData: SplashRefundData;
}

export interface SplashSpotOrderSettings {
  readonly orderStepCost: uint;
  readonly worstOrderStepCost: uint;
  readonly maxStepCount: uint;
  readonly maxStepCountMarket: uint;
  readonly approximatedTxFee: uint;
  readonly marketOrderPriceSlippage: percent;
}

export interface SplashSpotOrder extends SplashOperation {
  readonly settings: SplashSpotOrderSettings;
}

export interface SplashOperationsConfig {
  readonly operations: {
    readonly spotOrder: SplashSpotOrder;
    readonly depositDefault: SplashOperation;
    readonly depositFeeSwitch: SplashOperation;
    readonly swapDefault: SplashOperation;
    readonly depositWeighted: SplashOperation;
    readonly redeemDefault: SplashOperation;
    readonly redeemFeeSwitch: SplashOperation;
    readonly redeemWeighted: SplashOperation;
  };
}

export interface WithCredsDeserializer {
  credsDeserializer: (
    networkId: NetworkId,
    data: CborHexString,
  ) => {
    readonly requiredSigner: HexString;
    readonly address: Bech32String;
  };
}
// TODO: REWRITE
export interface SplashOperationsConfigWithCredsDeserializers {
  readonly operations: {
    readonly spotOrder: SplashSpotOrder & WithCredsDeserializer;
    readonly swapDefault: SplashOperation & WithCredsDeserializer;
    readonly depositDefault: SplashOperation & WithCredsDeserializer;
    readonly depositFeeSwitch: SplashOperation & WithCredsDeserializer;
    readonly depositWeighted: SplashOperation & WithCredsDeserializer;
    readonly redeemDefault: SplashOperation & WithCredsDeserializer;
    readonly redeemFeeSwitch: SplashOperation & WithCredsDeserializer;
    readonly redeemWeighted: SplashOperation & WithCredsDeserializer;
  };
}

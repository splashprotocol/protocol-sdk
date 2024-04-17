import { NetworkId } from '@dcspark/cardano-multiplatform-lib-browser';

import {
  Bech32String,
  CborHexString,
  HexString,
  percent,
  TransactionHash,
  uint,
} from './types.ts';

export interface SplashRefundData {
  readonly cost: {
    readonly mem: uint;
    readonly steps: uint;
  };
  readonly refUtxo: {
    readonly txHash: TransactionHash;
    readonly index: uint;
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
  readonly maxStepCount: uint;
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
    readonly depositDefault: SplashOperation & WithCredsDeserializer;
    readonly depositFeeSwitch: SplashOperation & WithCredsDeserializer;
    readonly depositWeighted: SplashOperation & WithCredsDeserializer;
    readonly redeemDefault: SplashOperation & WithCredsDeserializer;
    readonly redeemFeeSwitch: SplashOperation & WithCredsDeserializer;
    readonly redeemWeighted: SplashOperation & WithCredsDeserializer;
  };
}

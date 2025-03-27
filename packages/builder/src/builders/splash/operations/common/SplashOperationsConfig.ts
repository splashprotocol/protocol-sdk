import {
  CborHexString,
  OutputReference,
  percent,
  uint,
} from '@splashprotocol/core';

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
  readonly executorFee: uint;
}

export interface SplashSpotOrder extends SplashOperation {
  readonly settings: SplashSpotOrderSettings;
}

export interface SplashSpotOrderV2 extends SplashOperation {
  readonly settings: SplashSpotOrderSettings;
  readonly settingsV2: SplashSpotOrderSettings;
}

export interface SplashOperationsConfig {
  readonly operations: {
    readonly spotOrder: SplashSpotOrder;
    readonly spotOrderV2: SplashSpotOrderV2;
    readonly spotOrderV3: SplashSpotOrderV2;
    readonly depositDefault: SplashOperation;
    readonly depositFeeSwitch: SplashOperation;
    readonly swapDefault: SplashOperation;
    readonly depositWeighted: SplashOperation;
    readonly depositWeightedOld: SplashOperation;
    readonly depositStable: SplashOperation;
    readonly depositRoyalty: SplashOperation;
    readonly redeemDefault: SplashOperation;
    readonly redeemFeeSwitch: SplashOperation;
    readonly redeemWeighted: SplashOperation;
    readonly redeemWeightedV2: SplashOperation;
    readonly redeemStable: SplashOperation;
    readonly redeemRoyalty: SplashOperation;
  };
}

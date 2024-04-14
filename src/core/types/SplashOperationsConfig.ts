import { percent, TransactionHash, uint } from './types.ts';

export interface SplashRefundData {
  cost: {
    mem: uint;
    steps: uint;
  };
  refUtxo: {
    txHash: TransactionHash;
    index: uint;
  };
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
    readonly redeemDefault: SplashOperation;
    readonly redeemFeeSwitch: SplashOperation;
  };
}

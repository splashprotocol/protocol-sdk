import { Network, Tuple, uint } from '@splashprotocol/core';

export interface ProtocolParams {
  readonly network: Network;
  readonly protocolVersion: {
    readonly major: number;
    readonly minor: number;
  };
  readonly keyDeposit: bigint;
  readonly poolDeposit: bigint;
  readonly maxTxSize: number;
  readonly txFeeFixed: bigint;
  readonly txFeePerByte: bigint;
  readonly minUTxOValue: bigint;
  readonly coinsPerUtxoByte: bigint;
  readonly costModels: {
    readonly PlutusScriptV1: Tuple<uint, 166>;
    readonly PlutusScriptV2: Tuple<uint, 175>;
  };
  readonly executionUnitPrices: {
    readonly priceSteps: number;
    readonly priceMemory: number;
  };
  readonly maxTxExecutionUnits: {
    readonly steps: bigint;
    readonly memory: bigint;
  };
  readonly maxValueSize: number;
  readonly collateralPercentage: number;
  readonly maxCollateralInputs: number;
}

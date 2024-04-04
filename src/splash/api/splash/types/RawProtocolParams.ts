import { Tuple, uint } from '../../../../core/types/types.ts';

export interface RawProtocolParams {
  readonly maxValueSize: number;
  readonly collateralPercentage: number;
  readonly maxCollateralInputs: number;
  readonly maxTxExecutionUnits: {
    readonly steps: number;
    readonly memory: number;
  };
  readonly executionUnitPrices: {
    readonly priceSteps: number;
    readonly priceMemory: number;
  };
  readonly costModels: {
    readonly PlutusScriptV1: Tuple<uint, 166>;
    readonly PlutusScriptV2: Tuple<uint, 175>;
  };

  readonly stakeAddressDeposit: number;
  readonly stakePoolDeposit: number;
  readonly coinsPerUtxoByte: number;
  readonly maxTxSize: number;
  readonly txFeeFixed: number;
  readonly txFeePerByte: number;
  readonly minUTxOValue: number;
  readonly protocolVersion: {
    readonly major: number;
    readonly minor: number;
  };
}

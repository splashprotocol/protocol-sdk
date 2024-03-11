import {
  PlutusV1ScriptParams,
  PlutusV2ScriptParams,
} from '../../../../core/types/ProtocolParams.ts';

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
    PlutusScriptV2: PlutusV2ScriptParams;
    PlutusScriptV1: PlutusV1ScriptParams;
  };
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

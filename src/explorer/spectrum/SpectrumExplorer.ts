import axios from 'axios';

import { Explorer } from '../../core/explorer/Explorer.ts';
import {
  PlutusV1ScriptParams,
  PlutusV2ScriptParams,
  ProtocolParams,
} from '../../core/types/ProtocolParams.ts';

interface RawProtocolParams {
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

const mapNetworkToUrl: { [key in ProtocolParams['network']]: string } = {
  mainnet: 'https://explorer.spectrum.fi/cardano/mainnet/v1/',
  preprod: '',
  preview: 'https://explorer.spectrum.fi/cardano/preview/v1/',
};

export class SpectrumExplorer implements Explorer {
  constructor(private network: ProtocolParams['network']) {}
  async getProtocolParams(): Promise<ProtocolParams> {
    return axios
      .get<{ pparams: RawProtocolParams }>(
        `${mapNetworkToUrl[this.network]}/networkParams`,
      )
      .then((res) => {
        return res.data.pparams;
      })
      .then((data) => ({
        network: this.network,
        protocolVersion: data.protocolVersion,
        collateralPercentage: data.collateralPercentage,
        maxCollateralInputs: data.maxCollateralInputs,
        maxTxExecutionUnits: {
          memory: BigInt(data.maxTxExecutionUnits.memory),
          steps: BigInt(data.maxTxExecutionUnits.steps),
        },
        executionUnitPrices: {
          priceMemory: data.executionUnitPrices.priceMemory,
          priceSteps: data.executionUnitPrices.priceSteps,
        },
        costModels: data.costModels,
        coinsPerUtxoByte: BigInt(data.coinsPerUtxoByte),
        maxTxSize: BigInt(data.maxTxSize),
        txFeeFixed: BigInt(data.txFeeFixed),
        txFeePerByte: BigInt(data.txFeePerByte),
        minUTxOValue: BigInt(data.minUTxOValue),
        maxValueSize: BigInt(data.maxValueSize),
      }));
  }
}

import axios from 'axios';

import { Explorer } from '../../core/explorer/Explorer.ts';
import {
  PlutusV1ScriptParams,
  PlutusV2ScriptParams,
  ProtocolParams,
} from '../../core/types/ProtocolParams.ts';

const mapNetworkToUrl: { [key in ProtocolParams['network']]: string } = {
  mainnet: 'https://cardano-mainnet.blockfrost.io/api/v0',
  preview: 'https://cardano-preview.blockfrost.io/api/v0',
  preprod: 'https://cardano-preprod.blockfrost.io/api/v0',
};

interface RawProtocolParams {
  readonly protocol_major_ver: number;
  readonly protocol_minor_ver: number;
  readonly max_tx_size: number;
  readonly min_fee_b: number;
  readonly min_fee_a: number;
  readonly min_utxo: string;
  readonly coins_per_utxo_size: string;
  readonly cost_models: {
    readonly PlutusV1: PlutusV1ScriptParams;
    readonly PlutusV2: PlutusV2ScriptParams;
  };
  readonly price_mem: number;
  readonly price_step: number;
  readonly max_tx_ex_mem: string;
  readonly max_tx_ex_steps: string;
  readonly max_val_size: string;
  readonly collateral_percent: number;
  readonly max_collateral_inputs: number;
}

export class BlockfrostExplorer implements Explorer {
  constructor(
    private projectId: string,
    private network: ProtocolParams['network'],
  ) {}

  async getProtocolParams(): Promise<ProtocolParams> {
    return axios
      .get<RawProtocolParams>(
        `${mapNetworkToUrl[this.network]}/epochs/latest/parameters`,
        {
          headers: {
            project_id: this.projectId,
          },
        },
      )
      .then((res) => res.data)
      .then((data) => ({
        network: this.network,
        protocolVersion: {
          minor: data.protocol_minor_ver,
          major: data.protocol_major_ver,
        },
        maxTxSize: BigInt(data.max_tx_size),
        maxValueSize: BigInt(data.max_val_size),
        minUTxOValue: BigInt(data.min_utxo),
        txFeeFixed: BigInt(data.min_fee_b),
        txFeePerByte: BigInt(data.min_fee_a),
        costModels: {
          PlutusScriptV1: data.cost_models.PlutusV1,
          PlutusScriptV2: data.cost_models.PlutusV2,
        },
        maxTxExecutionUnits: {
          memory: BigInt(data.max_tx_ex_mem),
          steps: BigInt(data.max_tx_ex_steps),
        },
        maxCollateralInputs: data.max_collateral_inputs,
        collateralPercentage: data.collateral_percent,
        executionUnitPrices: {
          priceMemory: data.price_mem,
          priceSteps: data.price_step,
        },
        coinsPerUtxoByte: BigInt(data.coins_per_utxo_size),
      }));
  }
}

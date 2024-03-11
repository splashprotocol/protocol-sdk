import {
  Credential,
  EnterpriseAddress,
  NetworkId,
  PlutusData,
  ScriptHash,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { SingleOutputBuilderResult } from '@dcspark/cardano-multiplatform-lib-nodejs';

import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Output } from '../../../../core/models/output/Output.ts';
import { HexString } from '../../../../core/types/types.ts';
import { Operation } from '../common/Operation.ts';

export interface PayToContractScript {
  readonly script: HexString;
  readonly version: 'plutusV1' | 'plutusV2';
}

export const payToContract: Operation<
  [PayToContractScript, Currencies | Currency[], PlutusData?]
> = (script, currencies: Currencies | Currency[], data?: PlutusData) => {
  return ({ transactionBuilder, pParams, network }) => {
    const networkId =
      network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet();
    const contractAddress = EnterpriseAddress.new(
      Number(networkId.network()),
      Credential.new_script(ScriptHash.from_bech32(script.script)),
    )
      .to_address()
      .to_bech32();

    const output = Output.new(pParams, {
      address: contractAddress,
      value: currencies,
      data,
    });
    transactionBuilder.add_output(SingleOutputBuilderResult.new(output.wasm));

    return Promise.resolve();
  };
};

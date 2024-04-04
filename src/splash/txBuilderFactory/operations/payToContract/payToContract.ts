import {
  Credential,
  EnterpriseAddress,
  NetworkId,
  PlutusData,
  ScriptHash,
} from '@dcspark/cardano-multiplatform-lib-browser';

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
  return async ({ transactionCandidate, pParams, network }) => {
    const networkId =
      network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet();
    const contractAddress = EnterpriseAddress.new(
      Number(networkId.network()),
      Credential.new_script(ScriptHash.from_hex(script.script)),
    )
      .to_address()
      .to_bech32();

    const output = Output.new(pParams, {
      address: contractAddress,
      value: currencies,
      data,
    });
    transactionCandidate.addOutput(output);
  };
};

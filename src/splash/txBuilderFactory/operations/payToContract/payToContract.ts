import {
  BaseAddress,
  Credential,
  Ed25519KeyHash,
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

export interface PayToContractOptions {
  stakeKeyHash?: HexString;
  stakeKeyHashType?: 'script' | 'pubKey';
}

export const payToContract: Operation<
  [
    PayToContractScript,
    Currencies | Currency[],
    PlutusData?,
    PayToContractOptions?,
  ]
> = (
  script,
  currencies: Currencies | Currency[],
  data?: PlutusData,
  options?: PayToContractOptions,
) => {
  return async ({ transactionCandidate, pParams, network }) => {
    const networkId = Number(
      network === 'mainnet'
        ? NetworkId.mainnet().network()
        : NetworkId.testnet().network(),
    );
    const scriptCred = Credential.new_script(
      ScriptHash.from_hex(script.script),
    );
    const stakeCred =
      options?.stakeKeyHash && options.stakeKeyHashType === 'script'
        ? Credential.new_script(ScriptHash.from_hex(options.stakeKeyHash))
        : options?.stakeKeyHash
        ? Credential.new_pub_key(Ed25519KeyHash.from_hex(options.stakeKeyHash))
        : undefined;

    const contractAddress = stakeCred
      ? BaseAddress.new(networkId, scriptCred, stakeCred)
      : EnterpriseAddress.new(networkId, scriptCred);

    const output = Output.new(pParams, {
      address: contractAddress.to_address().to_bech32(),
      value: currencies,
      data,
    });
    transactionCandidate.addOutput(output);
    return output;
  };
};

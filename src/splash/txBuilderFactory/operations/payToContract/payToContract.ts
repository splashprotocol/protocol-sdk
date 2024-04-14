import {
  BaseAddress,
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

type Options = {
  userStakingCred?: Credential;
};

export const payToContract: Operation<
  [PayToContractScript, Currencies | Currency[], PlutusData?, Options?]
> = (
  script,
  currencies: Currencies | Currency[],
  data?: PlutusData,
  options?: Options,
) => {
  return async ({ transactionCandidate, pParams, network }) => {
    const networkId =
      network === 'mainnet' ? NetworkId.mainnet() : NetworkId.testnet();
    const networkNum = Number(networkId.network());

    const scriptCred = Credential.new_script(
      ScriptHash.from_hex(script.script),
    );

    const contractAddress =
      options && options.userStakingCred
        ? BaseAddress.new(networkNum, scriptCred, options.userStakingCred)
        : EnterpriseAddress.new(networkNum, scriptCred);

    const contractAddressBech32 = contractAddress.to_address().to_bech32();

    const output = Output.new(pParams, {
      address: contractAddressBech32,
      value: currencies,
      data,
    });
    transactionCandidate.addOutput(output);
    return output;
  };
};

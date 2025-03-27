import {
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
  HexString,
} from '@splashprotocol/core';
import { Operation } from '../../types/Operation.ts';
import { Output } from '../../models/Output/Output.ts';
import { BasicApi } from '@splashprotocol/api';
import { credentialsToBech32Address } from '../../utils/credentialsToBech32Address/credentialsToBech32Address.ts';
import { Credentials } from '../../types/Credentials.ts';

export interface PayToContractCredentials {
  readonly scriptHash: HexString;
  readonly stakeCredentials?: Credentials;
}

export const payToContract: Operation<
  [
    PayToContractCredentials | Bech32String,
    Currencies | Currency[],
    CborHexString?,
  ],
  BasicApi,
  Output
> = (
  credentials,
  currencies: Currencies | Currency[],
  data?: CborHexString,
) => {
  return async ({ transactionCandidate, pParams, network }) => {
    let contractAddress: Bech32String;
    if (credentials instanceof Object) {
      contractAddress = await credentialsToBech32Address(
        network,
        {
          hash: credentials.scriptHash,
          type: 'script',
        },
        credentials.stakeCredentials,
      );
    } else {
      contractAddress = credentials;
    }

    const output = await Output.new(pParams, {
      address: contractAddress,
      value: currencies,
      data,
    });
    transactionCandidate.addOutput(output);

    return output;
  };
};

import { Operation } from '../../types/Operation.ts';
import {
  Bech32String,
  CborHexString,
  Currencies,
  Currency,
} from '@splashprotocol/core';

import { Output } from '../../models/Output/Output.ts';
import { BasicApi } from '@splashprotocol/api';

export const payToAddress: Operation<
  [Bech32String, Currencies | Currency[], CborHexString?],
  BasicApi,
  Output
> =
  (
    address: Bech32String,
    currencies: Currencies | Currency[],
    data?: CborHexString,
  ) =>
  async ({ transactionCandidate, pParams }) => {
    const output = await Output.new(pParams, {
      address: address,
      value: currencies,
      data,
    });
    transactionCandidate.addOutput(output);
    return output;
  };

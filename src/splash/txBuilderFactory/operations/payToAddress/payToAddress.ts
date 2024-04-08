import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Output } from '../../../../core/models/output/Output.ts';
import { Bech32String } from '../../../../core/types/types.ts';
import { Operation } from '../common/Operation.ts';

export const payToAddress: Operation<
  [Bech32String, Currencies | Currency[], PlutusData?]
> =
  (
    address: Bech32String,
    currencies: Currencies | Currency[],
    data?: PlutusData,
  ) =>
  async ({ transactionCandidate, pParams }) => {
    const output = Output.new(pParams, {
      address: address,
      value: currencies,
      data,
    });
    transactionCandidate.addOutput(output);
    return output;
  };

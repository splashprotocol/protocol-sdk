import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';
import { SingleOutputBuilderResult } from '@dcspark/cardano-multiplatform-lib-nodejs';

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
  ({ transactionBuilder, pParams }) => {
    const output = Output.new(pParams, {
      address: address,
      value: currencies,
      data,
    });
    transactionBuilder.add_output(SingleOutputBuilderResult.new(output.wasm));

    return Promise.resolve();
  };

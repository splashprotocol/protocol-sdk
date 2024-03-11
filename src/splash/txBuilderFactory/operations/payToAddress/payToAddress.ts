import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Bech32String } from '../../../../core/types/types.ts';
import { Operation } from '../common/Operation.ts';

export const payToAddress: Operation<[Bech32String, Currencies | Currency[]]> =
  (address: Bech32String, currencies: Currencies | Currency[]) =>
  ({ transactionBuilder }) => {};

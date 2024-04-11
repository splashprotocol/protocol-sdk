import { Pair } from '../../../core/models/pair/Pair.ts';
import { Price } from '../../../core/models/price/Price.ts';
import { CurrencyConverter } from '../../../core/utils/currencyConverter/CurrencyConverter.ts';

export interface SelectRatesParams {
  readonly pairs: Pair[];
  readonly adaUsdPrice: Price;
}

export type SelectRatesResult = CurrencyConverter;

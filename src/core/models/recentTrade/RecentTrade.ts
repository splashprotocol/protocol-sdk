import { lts } from '../../types/types.ts';
import { Currency } from '../currency/Currency.ts';
import { Price } from '../price/Price.ts';

export interface RecentTrade {
  readonly from: Currency;
  readonly to: Currency;
  readonly price: Price;
  readonly timestamp: lts;
  readonly side: 'buy' | 'sell';
}

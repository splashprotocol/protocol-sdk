import { Currency } from '../../../core/models/currency/Currency.ts';
import { Price } from '../../../core/models/price/Price.ts';
import { OrderBook } from '../../api/common/types/OrderBook.ts';

export interface SelectEstimatedPriceParams {
  readonly orderBook: OrderBook;
  readonly input: Currency;
  readonly priceType?: 'average' | 'actual';
}

export type SelectEstimatedPriceResult = Price;

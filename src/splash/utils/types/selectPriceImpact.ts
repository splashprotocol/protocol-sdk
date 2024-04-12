import { Currency } from '../../../core/models/currency/Currency.ts';
import { Price } from '../../../core/models/price/Price.ts';
import { percent } from '../../../core/types/types.ts';
import { OrderBook } from '../../api/common/types/OrderBook.ts';

export interface SelectPriceImpactParams {
  readonly orderBook: OrderBook;
  readonly input: Currency | Price;
}

export type SelectPriceImpactResult = percent;

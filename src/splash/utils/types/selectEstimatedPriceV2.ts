import { Currency } from '../../../core/models/currency/Currency.ts';
import { Price } from '../../../core/models/price/Price.ts';
import { OrderBook } from '../../api/common/types/OrderBook.ts';

interface CommonParams {
  readonly orderBook: OrderBook;
  readonly priceType?: 'average' | 'actual';
}

type OutputParams = { readonly output: Currency } & CommonParams;

type InputParams = { readonly input: Currency } & CommonParams;

export type SelectEstimatedPriceV2Params = OutputParams | InputParams;

export type SelectEstimatedPriceV2Result = Price;

export const isEstimatedPriceV2OutputType = (
  params: SelectEstimatedPriceV2Params,
): params is OutputParams => {
  return (params as any).output;
};

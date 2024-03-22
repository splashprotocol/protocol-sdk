import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { RawOrderBook } from '../common/RawOrderBook.ts';

export interface GetOrderBookParams {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
}

export type GetOrderBookResponse = RawOrderBook;

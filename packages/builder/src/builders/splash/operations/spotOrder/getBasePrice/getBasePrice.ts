import { AssetInfo, Currency, Price } from '@splashprotocol/core';
import { selectEstimatedPrice, SplashApiType } from '@splashprotocol/api';

export interface GetBasePriceConfig {
  readonly input: Currency;
  readonly outputAsset: AssetInfo;
  readonly price: Price | undefined;
  readonly slippage: number;
}
export const getBasePrice = async (
  { price, input, outputAsset, slippage }: GetBasePriceConfig,
  api: SplashApiType,
): Promise<Price> => {
  let basePrice: Price;

  if (price) {
    basePrice = price;
  } else {
    basePrice = selectEstimatedPrice({
      orderBook: await api.getOrderBook({
        base: input.asset,
        quote: outputAsset,
      }),
      input,
    }).priceFromPct(100 + slippage);
  }

  return basePrice.base.isEquals(input.asset) ? basePrice : basePrice.invert();
};

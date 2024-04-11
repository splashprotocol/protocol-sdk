import { ada } from '../../models/assetInfo/ada.ts';
import { AssetInfo } from '../../models/assetInfo/AssetInfo.ts';
import { usd } from '../../models/assetInfo/usd.ts';
import { Currency } from '../../models/currency/Currency.ts';
import { Price } from '../../models/price/Price.ts';
import { Dictionary } from '../../types/types.ts';

export interface CurrencyConverterConfig {
  readonly prices: Price[];
  readonly adaUsdPrice: Price;
}

/**
 * Currency converter service
 */
export class CurrencyConverter {
  /**
   * Create currency converter instance from config
   * @param {CurrencyConverterConfig} config
   * @return {CurrencyConverter}
   */
  static new(config: CurrencyConverterConfig): CurrencyConverter {
    return new CurrencyConverter(config);
  }

  private mapSplashIdToPrice: Dictionary<Price | undefined>;

  private adaUsdPrice: Price;

  private adaAdaPrice = Price.new({
    base: ada,
    quote: ada,
    raw: 1,
  });

  /**
   * Converts input to ada|usd currency
   * @param {Currency} input
   * @param {"ada" | "usd"} to
   * @return {Currency}
   */
  convert(input: Currency, to: 'ada' | 'usd' = 'ada'): Currency {
    return this.getPrice(input.asset, to).getNecessaryQuoteFor(input);
  }

  /**
   * Returns price by input
   * @param {AssetInfo} asset
   * @param {"ada" | "usd"} to
   * @return {Price}
   */
  getPrice(asset: AssetInfo, to: 'ada' | 'usd' = 'ada'): Price {
    if (asset.isAda()) {
      return to === 'ada' ? this.adaAdaPrice : this.adaUsdPrice;
    }

    const inputAdaPrice = this.mapSplashIdToPrice[asset.splashId];
    const outputAsset = to === 'ada' ? ada : usd;

    if (!inputAdaPrice) {
      return Price.new({
        base: asset,
        quote: outputAsset,
        raw: 0,
      });
    }
    if (to === 'ada') {
      return inputAdaPrice;
    }
    return inputAdaPrice.cross(this.adaUsdPrice);
  }

  private constructor({ prices, adaUsdPrice }: CurrencyConverterConfig) {
    this.mapSplashIdToPrice = prices.reduce<Dictionary<Price | undefined>>(
      (dictionary, price): Dictionary<Price | undefined> => {
        if (dictionary[price.base.splashId]) {
          return dictionary;
        }
        return { ...dictionary, [price.base.splashId]: price };
      },
      {},
    );
    this.adaUsdPrice = adaUsdPrice;
  }
}

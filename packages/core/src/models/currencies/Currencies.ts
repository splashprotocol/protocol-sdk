import { AssetInfo, AssetInfoMetadata } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';
import { MinuendEqualsZeroError } from './errors/MinuendEqualsZeroError.ts';
import { CborHexString } from '../../types/CborHexString.ts';
import { Dictionary } from '../../types/Dictionary.ts';
import { Cbor } from '../../utils/cbor/Cbor.ts';
import { bytesToHex } from '../../utils/encoding/bytesToHex/bytesToHex.ts';

export class Currencies {
  /**
   * empty currencies structure
   * @returns {Currencies}
   */
  static get empty(): Currencies {
    return Currencies.new([]);
  }

  /**
   * Produce Currencies structure instance
   * @param {Currency[]} currencies
   * @returns {Currencies}
   */
  static new(currencies: Currency[]): Currencies {
    return new Currencies(currencies);
  }

  /**
   * Produce Currencies structure instance from cbor
   * @param {CborHexString} cbor
   * @returns {Currencies}
   */
  static fromCbor(cbor: CborHexString): Currencies;

  /**
   * Produce Currencies structure instance from cbor and metadata callback
   * @param {CborHexString} cbor
   * @param {Function} withMetadata
   * @returns {Currencies}
   */
  static fromCbor(
    cbor: CborHexString,
    withMetadata: (c: Currency) => AssetInfoMetadata | undefined,
  ): Currencies;

  /**
   * Produce Currencies structure instance from cbor and metadata async callback
   * @param {CborHexString} cbor
   * @param {Function} withMetadata
   * @returns {Currencies}
   */
  static fromCbor(
    cbor: CborHexString,
    withMetadata: (c: Currency) => Promise<AssetInfoMetadata | undefined>,
  ): Promise<Currencies>;

  static fromCbor(
    cbor: CborHexString,
    withMetadata?: (
      c: Currency,
    ) => undefined | AssetInfoMetadata | Promise<AssetInfoMetadata | undefined>,
  ): Currencies | Promise<Currencies> {
    const encoded = Cbor.ValueCbor.decodeCborHexToObject(cbor);
    const [adaAmount, policies] =
      encoded instanceof Array
        ? [encoded[0], encoded[1] instanceof Map ? encoded[1] : new Map()]
        : [encoded, new Map()];
    const ada = Currency.ada(BigInt(adaAmount));
    const currencies: Currency[] = [];

    for (let [policyId, assets] of policies) {
      for (let [asset, amount] of assets) {
        currencies.push(
          Currency.new(
            BigInt(amount),
            AssetInfo.fromBase16(bytesToHex(policyId), bytesToHex(asset)),
          ),
        );
      }
    }

    if (!withMetadata) {
      return new Currencies([ada, ...currencies]);
    }

    const currenciesWithMetadata = currencies.map((c) => {
      const metadata = withMetadata(c);

      if (!metadata) {
        return c;
      }
      if (metadata instanceof Promise) {
        return metadata.then((m) =>
          m ? Currency.new(c.amount, c.asset.withMetadata(m)) : c,
        );
      }
      return Currency.new(c.amount, c.asset.withMetadata(metadata));
    });

    return currenciesWithMetadata[0] instanceof Promise
      ? Promise.all(currenciesWithMetadata).then(
          (currencies) => new Currencies([ada, ...currencies]),
        )
      : //   @ts-ignore
        new Currencies([ada, ...currenciesWithMetadata]);
  }

  private currencyMap: Map<string, Currency>;

  private constructor(private currencies: Currency[]) {
    this.currencyMap = new Map<string, Currency>(
      Object.entries(
        this.currencies.reduce<Dictionary<Currency>>((acc, item) => {
          if (!acc[item.asset.assetId]) {
            return {
              ...acc,
              [item.asset.assetId]: item,
            };
          }
          return {
            ...acc,
            [item.asset.assetId]: acc[item.asset.assetId].plus(item),
          };
        }, {}),
      ),
    );
  }

  /**
   * Returns Currency or undefined by assetInfo
   * @param {AssetInfo} asset
   * @returns {Currency}
   */
  get(asset: AssetInfo): Currency {
    return this.currencyMap.get(asset.assetId) || Currency.new(0n, asset);
  }

  /**
   * Returns available ada value
   * @returns {Currency}
   */
  get ada(): Currency {
    return this.currencyMap.get(AssetInfo.ada.assetId) || Currency.ada(0n);
  }

  /**
   * Returns available spf value
   * @returns {Currency}
   */
  get spf(): Currency {
    return this.currencyMap.get(AssetInfo.spf.assetId) || Currency.spf(0n);
  }

  /**
   * Returns available splash value
   * @returns {Currency}
   */
  get splash(): Currency {
    return (
      this.currencyMap.get(AssetInfo.splash.assetId) || Currency.splash(0n)
    );
  }

  /**
   * Sum two currencies
   * @param {Currencies | Currency[]} currencies
   * @returns {Currencies}
   */
  plus(currencies: Currencies | Currency[]): Currencies {
    const toSum: Currencies =
      currencies instanceof Currencies
        ? currencies
        : Currencies.new(currencies);
    const resultMap = Array.from(toSum.currencyMap.values()).reduce<
      Map<string, Currency>
    >((map, item) => {
      const splashId = item.asset.assetId;
      if (map.has(splashId)) {
        map.set(splashId, map.get(splashId)!.plus(item));
      } else {
        map.set(splashId, item);
      }
      return map;
    }, new Map(this.currencyMap.entries()));

    return Currencies.new(Array.from(resultMap.values()));
  }

  /**
   * Subtract  currencies argument from current currencies. Value of assets can't be lower than 0
   * @param {Currencies | Currencies[]} currencies
   * @returns {Currencies}
   */
  minus(currencies: Currencies | Currency[]): Currencies {
    const toSubtract: Currencies =
      currencies instanceof Currencies
        ? currencies
        : Currencies.new(currencies);
    const resultMap = Array.from(toSubtract.currencyMap.values()).reduce<
      Map<string, Currency>
    >((map, item) => {
      const splashId = item.asset.assetId;
      if (!map.has(splashId)) {
        throw new MinuendEqualsZeroError(`minuend is equals zero. ${splashId}`);
      }
      const result = map.get(splashId)!.minus(item);
      if (result.isPositive()) {
        map.set(splashId, result);
      } else {
        map.delete(splashId);
      }
      return map;
    }, new Map(this.currencyMap.entries()));

    return Currencies.new(Array.from(resultMap.values()));
  }

  /**
   * Returns only insufficient assets
   * @param {Currencies | Currency[]} currencies
   * @return {Currencies}
   */
  getInsufficientCurrenciesFor(
    currencies: Currencies | Currency[],
  ): Currencies {
    const toSubtract: Currencies =
      currencies instanceof Currencies
        ? currencies
        : Currencies.new(currencies);

    const resultMap = Array.from(toSubtract.currencyMap.values()).reduce<
      Map<string, Currency>
    >(
      (map, item) => {
        const splashId = item.asset.assetId;
        if (!map.has(splashId)) {
          map.set(splashId, item);
          return map;
        }
        if (map.get(splashId)!.lt(item)) {
          map.set(splashId, item.minus(map.get(splashId)!));
        }
        if (map.get(splashId)!.gte(item)) {
          map.delete(splashId);
        }
        return map;
      },
      new Map(
        Array.from(this.currencyMap.entries()).filter(([key, _]) =>
          toSubtract.currencyMap.has(key),
        ),
      ),
    );

    return Currencies.new(Array.from(resultMap.values()));
  }

  /**
   * Returns true if structure has enough assets for subtract
   * @param {Currencies | Currency[]} currencies
   * @returns {boolean}
   */
  isAssetsEnough(currencies: Currencies | Currency[]): boolean {
    const toCompare: Currencies =
      currencies instanceof Currencies
        ? currencies
        : Currencies.new(currencies);

    for (const item of toCompare.currencies) {
      const splashId = item.asset.assetId;

      if (!this.currencyMap.get(splashId)?.gte(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns currencies collection
   * @returns {Currency[]}
   */
  toArray(): Currency[] {
    return this.currencies;
  }
}

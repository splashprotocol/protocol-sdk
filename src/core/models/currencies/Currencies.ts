import {
  MapAssetNameToCoin,
  MultiAsset,
  ScriptHash,
  Value,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { AssetMetadata } from '../../api/types/common/AssetMetadata.ts';
import { CborHexString, Dictionary } from '../../types/types.ts';
import { ada } from '../assetInfo/ada.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { spf } from '../assetInfo/spf.ts';
import { Currency } from '../currency/Currency.ts';
import { MinuendEqualsZeroError } from './errors/MinuendEqualsZeroError.ts';

export interface CurrenciesCborParams {
  readonly value: CborHexString;
}

export interface CurrenciesWasmParams {
  readonly value: Value;
}

export interface CurrenciesArrayParams {
  readonly value: Currency[];
}

/**
 * Wasm Value structure wrapper
 */
export class Currencies {
  /**
   * empty currencies structure
   * @returns {Currencies}
   */
  static empty = this.fromCurrencyArray([]);

  /**
   * Produce Currencies structure instance
   * @param {CborHexString | Currency[] | Value} value
   * @param {Dictionary<AssetMetadata> | undefined} metadata
   * @returns {Currencies}
   */
  static new(
    value: CborHexString | Currency[] | Value,
    metadata?: Dictionary<AssetMetadata>,
  ): Currencies {
    if (typeof value === 'string') {
      return this.fromCborHex(value, metadata);
    }
    if (value instanceof Array) {
      return this.fromCurrencyArray(value, metadata);
    }
    return this.fromWasmValue(value, metadata);
  }

  private static fromCborHex(
    cborHex: CborHexString,
    metadata?: Dictionary<AssetMetadata>,
  ): Currencies {
    return this.fromWasmValue(Value.from_cbor_hex(cborHex), metadata);
  }

  private static fromWasmValue(
    value: Value,
    metadata?: Dictionary<AssetMetadata>,
  ): Currencies {
    const ada = Currency.ada(BigInt(value.coin().toString()));
    const ma = value.multi_asset();

    if (!ma) {
      return this.fromCurrencyArray([ada]);
    }

    const policies = ma.keys();
    const numPolicies = policies.len();
    const assetsData: [ScriptHash, MapAssetNameToCoin][] = [];

    for (let i = 0; i < numPolicies; i++) {
      const p = policies.get(i);
      const assets = ma.get_assets(p);

      if (assets) {
        assetsData.push([p, assets]);
      }
    }

    const currencies: Currency[] = assetsData.flatMap(([policyId, assets]) => {
      const assetNames = assets.keys();
      const numAssets = assets.len();
      const result: Currency[] = [];

      for (let i = 0; i < numAssets; i++) {
        const assetName = assetNames.get(i);
        const amount = BigInt(assets.get(assetName)!.toString());
        result.push(
          Currency.new(
            amount,
            AssetInfo.new({
              policyId: policyId.to_hex(),
              name: assetName.to_cbor_hex(),
              type: 'cbor',
            }),
          ),
        );
      }

      return result;
    });

    return this.fromCurrencyArray([ada].concat(currencies), metadata);
  }

  private static fromCurrencyArray(
    currencies: Currency[],
    metadata?: Dictionary<AssetMetadata>,
  ): Currencies {
    if (!metadata) {
      return new Currencies(currencies);
    }

    return new Currencies(
      currencies.map((c) => {
        const cMetadata = metadata[c.asset.splashId];

        return cMetadata && !c.asset['metadata']
          ? Currency.new(c.amount, c.asset.withMetadata(cMetadata))
          : c;
      }),
    );
  }

  private currencyMap: Map<string, Currency>;

  private constructor(private currencies: Currency[]) {
    this.currencyMap = new Map<string, Currency>(
      Object.entries(
        this.currencies.reduce<Dictionary<Currency>>((acc, item) => {
          if (!acc[item.asset.splashId]) {
            return {
              ...acc,
              [item.asset.splashId]: item,
            };
          }
          return {
            ...acc,
            [item.asset.splashId]: acc[item.asset.splashId].plus(item),
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
    return this.currencyMap.get(asset.splashId) || Currency.new(0n, asset);
  }

  /**
   * Returns available ada value
   * @returns {Currency}
   */
  get ada(): Currency {
    return this.currencyMap.get(ada.splashId) || Currency.ada(0n);
  }

  /**
   * Returns available spf value
   * @returns {Currency}
   */
  get spf(): Currency {
    return this.currencyMap.get(spf.splashId) || Currency.spf(0n);
  }

  /**
   * Returns available splash value
   * @returns {Currency}
   */
  get splash(): Currency {
    return this.currencyMap.get(spf.splashId) || Currency.splash(0n);
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
        : Currencies.fromCurrencyArray(currencies);
    const resultMap = Array.from(toSum.currencyMap.values()).reduce<
      Map<string, Currency>
    >((map, item) => {
      const splashId = item.asset.splashId;
      if (map.has(splashId)) {
        map.set(splashId, map.get(splashId)!.plus(item));
      } else {
        map.set(splashId, item);
      }
      return map;
    }, new Map(this.currencyMap.entries()));

    return Currencies.fromCurrencyArray(Array.from(resultMap.values()));
  }

  /**
   * Subtract  currencies argument from current currencies. Value of assets can't be lower than 0
   * @param {AssetAmountSet | Currencies[]} currencies
   * @returns {AssetAmountSet}
   */
  minus(currencies: Currencies | Currency[]): Currencies {
    const toSubtract: Currencies =
      currencies instanceof Currencies
        ? currencies
        : Currencies.fromCurrencyArray(currencies);
    const resultMap = Array.from(toSubtract.currencyMap.values()).reduce<
      Map<string, Currency>
    >((map, item) => {
      const splashId = item.asset.splashId;
      if (map.has(splashId)) {
        map.set(splashId, map.get(splashId)!.minus(item));
      } else {
        throw new MinuendEqualsZeroError(`minuend is equals zero. ${splashId}`);
      }
      return map;
    }, new Map(this.currencyMap.entries()));

    return Currencies.fromCurrencyArray(Array.from(resultMap.values()));
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
        : Currencies.fromCurrencyArray(currencies);

    for (const item of toCompare.currencies) {
      const splashId = item.asset.splashId;

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

  /**
   * Returns Wasm Value representation
   * @returns {Value}
   */
  toWasmValue(): Value {
    const groupedAssetsByPolicyId = this.currencies
      .filter((asset) => asset.asset.splashId !== ada.splashId)
      .reduce<Map<string, Currency[]>>((acc, item) => {
        if (!acc.has(item.asset.policyId)) {
          acc.set(item.asset.policyId, []);
        }
        acc.set(
          item.asset.policyId,
          acc.get(item.asset.policyId)!.concat([item]),
        );

        return acc;
      }, new Map());

    const multiAssets: MultiAsset = Array.from<[string, Currency[]]>(
      groupedAssetsByPolicyId.entries(),
    ).reduce<MultiAsset>((ma, [policyId, currencies]) => {
      const wAssets = MapAssetNameToCoin.new();
      const wPolicyId = ScriptHash.from_hex(policyId);

      for (const currency of currencies) {
        wAssets.insert(currency.asset.wasmName, currency.amount);
      }

      ma.insert_assets(wPolicyId, wAssets);
      return ma;
    }, MultiAsset.new());

    const amount = this.ada?.amount;

    return multiAssets.keys().len()
      ? Value.new(amount || 0n, multiAssets)
      : Value.from_coin(amount || 0n);
  }

  /**
   * Returns valid cbor hex string representation
   * @returns {CborHexString}
   */
  toCborHex(): CborHexString {
    return this.toWasmValue().to_cbor_hex();
  }
}

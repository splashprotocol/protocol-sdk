import {
  Assets,
  BigNum,
  MultiAsset,
  ScriptHash,
  Value,
} from '@emurgo/cardano-serialization-lib-browser';

import { CborHexString } from '../../types/types';
import { AssetAmount } from '../assetAmount/AssetAmount';
import { adaAssetInfo } from '../assetInfo/adaAssetInfo';
import { AssetInfo } from '../assetInfo/AssetInfo';
import { spfAssetInfo } from '../assetInfo/spfAssetInfo';

/**
 * Wasn Value structure wrapper
 */
export class AssetAmountSet {
  /**
   * Creates a valid instance from cbor hex string
   * @param {CborHexString} cborHex
   * @returns {AssetAmountSet}
   */
  static fromCborHex(cborHex: CborHexString): AssetAmountSet {
    return this.fromWasmValue(Value.from_hex(cborHex));
  }

  /**
   * Creates a valid instance from wasm Value structure
   * @param {Value} value
   * @returns {AssetAmountSet}
   */
  static fromWasmValue(value: Value): AssetAmountSet {
    const adaAssetAmount = AssetAmount.adaAssetAmount(
      BigInt(value.coin().to_str()),
    );
    const ma = value.multiasset();

    if (!ma) {
      return this.fromAssetAmountArray([adaAssetAmount]);
    }

    const policies = ma.keys();
    const numPolicies = policies.len();
    const assetsData: [ScriptHash, Assets][] = [];

    for (let i = 0; i < numPolicies; i++) {
      const p = policies.get(i);
      assetsData.push([p, ma.get(p)!]);
    }

    const assetsAmount: AssetAmount[] = assetsData.flatMap(
      ([policyId, assets]) => {
        const assetNames = assets.keys();
        const numAssets = assets.len();
        const result: AssetAmount[] = [];

        for (let i = 0; i < numAssets; i++) {
          const assetName = assetNames.get(i);
          const amount = BigInt(assets.get(assetName)!.to_str());
          result.push(
            new AssetAmount(
              amount,
              AssetInfo.fromNameCborHex(policyId.to_hex(), assetName.to_hex()),
            ),
          );
        }

        return result;
      },
    );

    return this.fromAssetAmountArray([adaAssetAmount].concat(assetsAmount));
  }

  /**
   * Creates a valid instance from assetAmount collection
   * @param {AssetAmount[]} assetsAmount
   * @returns {AssetAmountSet}
   */
  static fromAssetAmountArray(assetsAmount: AssetAmount[]): AssetAmountSet {
    return new AssetAmountSet(assetsAmount);
  }

  private assetAmountMap: Map<string, AssetAmount>;

  constructor(private assets: AssetAmount[]) {
    this.assetAmountMap = new Map<string, AssetAmount>(
      this.assets.map((a) => [a.assetInfo.spectrumId, a]),
    );
  }

  /**
   * Returns AssetAmount or undefined by assetInfo
   * @param {AssetInfo} asset
   * @returns {AssetAmount | undefined}
   */
  get(asset: AssetInfo): AssetAmount | undefined {
    return this.assetAmountMap.get(asset.spectrumId);
  }

  /**
   * Returns available ada value
   * @returns {AssetAmount | undefined}
   */
  getAda(): AssetAmount | undefined {
    return this.assetAmountMap.get(adaAssetInfo.spectrumId);
  }

  /**
   * Returns available spf value
   * @returns {AssetAmount | undefined}
   */
  getSpf(): AssetAmount | undefined {
    return this.assetAmountMap.get(spfAssetInfo.spectrumId);
  }

  /**
   * Sum two assetAmountSet
   * @param {AssetAmountSet | AssetAmount[]} assetAmountSet
   * @returns {AssetAmountSet}
   */
  plus(assetAmountSet: AssetAmountSet | AssetAmount[]): AssetAmountSet {
    const toSum: AssetAmountSet =
      assetAmountSet instanceof AssetAmountSet
        ? assetAmountSet
        : AssetAmountSet.fromAssetAmountArray(assetAmountSet);
    const resultMap = Array.from(toSum.assetAmountMap.values()).reduce<
      Map<string, AssetAmount>
    >((map, item) => {
      const spectrumId = item.assetInfo.spectrumId;
      if (map.has(spectrumId)) {
        map.set(spectrumId, map.get(spectrumId)!.plus(item));
      } else {
        map.set(spectrumId, item);
      }
      return map;
    }, new Map(this.assetAmountMap.entries()));

    return AssetAmountSet.fromAssetAmountArray(Array.from(resultMap.values()));
  }

  /**
   * Subtract  asset amount set argument from current asset amount set. Value of assets can't be lower than 0
   * @param {AssetAmountSet | AssetAmount[]} assetAmountSet
   * @returns {AssetAmountSet}
   */
  minus(assetAmountSet: AssetAmountSet | AssetAmount[]): AssetAmountSet {
    const toSubtract: AssetAmountSet =
      assetAmountSet instanceof AssetAmountSet
        ? assetAmountSet
        : AssetAmountSet.fromAssetAmountArray(assetAmountSet);
    const resultMap = Array.from(toSubtract.assetAmountMap.values()).reduce<
      Map<string, AssetAmount>
    >((map, item) => {
      const spectrumId = item.assetInfo.spectrumId;
      if (map.has(spectrumId)) {
        map.set(spectrumId, map.get(spectrumId)!.minus(item));
      } else {
        throw new Error(`minuend is equals zero. ${spectrumId}`);
      }
      return map;
    }, new Map(this.assetAmountMap.entries()));

    return AssetAmountSet.fromAssetAmountArray(Array.from(resultMap.values()));
  }

  /**
   * Returns true if structure has enough assets for subtract
   * @param {AssetAmountSet | AssetAmount[]} assetAmountSet
   * @returns {boolean}
   */
  isAssetsEnough(assetAmountSet: AssetAmountSet | AssetAmount[]): boolean {
    const toCompare: AssetAmountSet =
      assetAmountSet instanceof AssetAmountSet
        ? assetAmountSet
        : AssetAmountSet.fromAssetAmountArray(assetAmountSet);

    for (const item of toCompare.assets) {
      const spectrumId = item.assetInfo.spectrumId;

      if (!this.assetAmountMap.get(spectrumId)?.gt(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns asset amount collection
   * @returns {AssetAmount[]}
   */
  toAssetAmountArray(): AssetAmount[] {
    return this.assets;
  }

  /**
   * Returns Wasm Value representation
   * @returns {Value}
   */
  toWasmValue(): Value {
    const groupedAssetsByPolicyId = this.assets
      .filter((asset) => asset.assetInfo.spectrumId !== adaAssetInfo.spectrumId)
      .reduce<Map<string, AssetAmount[]>>((acc, item) => {
        if (!acc.has(item.assetInfo.policyId)) {
          acc.set(item.assetInfo.policyId, []);
        }
        acc.set(
          item.assetInfo.policyId,
          acc.get(item.assetInfo.policyId)!.concat([item]),
        );

        return acc;
      }, new Map());

    const multiAssets: MultiAsset = Array.from<[string, AssetAmount[]]>(
      groupedAssetsByPolicyId.entries(),
    ).reduce<MultiAsset>((ma, [policyId, assetAmounts]) => {
      const wAssets = Assets.new();
      const wPolicyId = ScriptHash.from_hex(policyId);

      for (const assetAmount of assetAmounts) {
        wAssets.insert(
          assetAmount.assetInfo.wasmName,
          BigNum.from_str(assetAmount.amount.toString()),
        );
      }

      ma.insert(wPolicyId, wAssets);
      return ma;
    }, MultiAsset.new());

    const wValue = Value.zero();
    const amount = this.getAda()?.amount;

    if (amount) {
      wValue.set_coin(BigNum.from_str(amount.toString()));
    }
    if (multiAssets.len()) {
      wValue.set_multiasset(multiAssets);
    }
    return wValue;
  }

  /**
   * Returns valid cbor hex string representation
   * @returns {CborHexString}
   */
  toCborHex(): CborHexString {
    return this.toWasmValue().to_hex();
  }
}

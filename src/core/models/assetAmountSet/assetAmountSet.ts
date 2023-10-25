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

export class AssetAmountSet {
  static fromCborHex(cborHex: CborHexString): AssetAmountSet {
    return this.fromWasmValue(Value.from_hex(cborHex));
  }

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

  static fromAssetAmountArray(assetsAmount: AssetAmount[]): AssetAmountSet {
    return new AssetAmountSet(assetsAmount);
  }

  private assetAmountMap = new Map<string, AssetAmount>(
    this.assets.map((a) => [a.assetInfo.spectrumId, a]),
  );

  constructor(private assets: AssetAmount[]) {}

  get(asset: AssetInfo): AssetAmount | undefined {
    return this.assetAmountMap.get(asset.spectrumId);
  }

  getAda(): AssetAmount | undefined {
    return this.assetAmountMap.get(adaAssetInfo.spectrumId);
  }

  getSpf(): AssetAmount | undefined {
    return this.assetAmountMap.get(spfAssetInfo.spectrumId);
  }

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

  toAssetAmountArray(): AssetAmount[] {
    return this.assets;
  }

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
          assetAmount.assetInfo.toWasmName(),
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

  toCborHex(): CborHexString {
    return this.toWasmValue().to_hex();
  }
}

import { adaAssetInfo } from '../assetInfo/adaAssetInfo';
import { AssetInfo } from '../assetInfo/AssetInfo';
import { spfAssetInfo } from '../assetInfo/spfAssetInfo';

export class AssetAmount {
  static adaAssetAmount(amount: bigint) {
    return new AssetAmount(amount, adaAssetInfo);
  }

  static spfAssetAmount(amount: bigint) {
    return new AssetAmount(amount, spfAssetInfo);
  }

  constructor(
    public amount: bigint,
    public assetInfo: AssetInfo,
  ) {}

  withAmount(amount: bigint): AssetAmount {
    return new AssetAmount(amount, this.assetInfo);
  }

  gt(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount > assetAmount;
    } else {
      return this.amount > assetAmount.amount;
    }
  }

  gte(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount >= assetAmount;
    } else {
      return this.amount >= assetAmount.amount;
    }
  }

  lt(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount < assetAmount;
    } else {
      return this.amount < assetAmount.amount;
    }
  }

  lte(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount <= assetAmount;
    } else {
      return this.amount <= assetAmount.amount;
    }
  }

  plus(assetAmount: bigint | AssetAmount): AssetAmount {
    this.assetAssetAmount(assetAmount, 'sum');
    if (typeof assetAmount === 'bigint') {
      return this.withAmount(this.amount + assetAmount);
    }
    return this.withAmount(this.amount + assetAmount.amount);
  }

  minus(assetAmount: bigint | AssetAmount): AssetAmount {
    this.assetAssetAmount(assetAmount, 'minus');

    const amountToMinus: bigint =
      typeof assetAmount === 'bigint' ? assetAmount : assetAmount.amount;

    if (this.gte(amountToMinus)) {
      return this.withAmount(this.amount - amountToMinus);
    }

    throw new Error(
      `result of minus is lower than 0. ${this.assetInfo.subject}`,
    );
  }

  private assetAssetAmount(
    assetAmount: AssetAmount | bigint,
    operationName: string,
  ): void {
    if (typeof assetAmount === 'bigint') {
      return;
    }
    if (this.assetInfo.subject !== assetAmount.assetInfo.subject) {
      throw new Error(
        `can't ${operationName} different amount with different asset info. ${this.assetInfo.spectrumId} and ${assetAmount.assetInfo.spectrumId}`,
      );
    }
  }
}

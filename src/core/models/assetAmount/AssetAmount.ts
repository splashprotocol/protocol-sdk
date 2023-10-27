import { adaAssetInfo } from '../assetInfo/adaAssetInfo';
import { AssetInfo } from '../assetInfo/AssetInfo';
import { spfAssetInfo } from '../assetInfo/spfAssetInfo';

/**
 * representation of asset info with some amount
 */
export class AssetAmount {
  /**
   * creates assetAmount with ada asset info
   * @param {bigint} amount
   * @returns {AssetAmount}
   */
  static adaAssetAmount(amount: bigint) {
    return new AssetAmount(amount, adaAssetInfo);
  }

  /**
   * creates assetAmount with spf asset info
   * @param {bigint} amount
   * @returns {AssetAmount}
   */
  static spfAssetAmount(amount: bigint) {
    return new AssetAmount(amount, spfAssetInfo);
  }

  constructor(
    public amount: bigint,
    public assetInfo: AssetInfo,
  ) {}

  /**
   * Creates new asset amount instance with specified amount and same assetInfo
   * @param {bigint} amount
   * @returns {AssetAmount}
   */
  withAmount(amount: bigint): AssetAmount {
    return new AssetAmount(amount, this.assetInfo);
  }

  /**
   * Returns true if current asset amount greater than param
   * @param {AssetAmount | bigint} assetAmount
   * @returns {boolean}
   */
  gt(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount > assetAmount;
    } else {
      return this.amount > assetAmount.amount;
    }
  }

  /**
   * Returns true if current asset amount greater or equals than param
   * @param {AssetAmount | bigint} assetAmount
   * @returns {boolean}
   */
  gte(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount >= assetAmount;
    } else {
      return this.amount >= assetAmount.amount;
    }
  }

  /**
   * Returns true if current asset amount lower than param
   * @param {AssetAmount | bigint} assetAmount
   * @returns {boolean}
   */
  lt(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount < assetAmount;
    } else {
      return this.amount < assetAmount.amount;
    }
  }

  /**
   * Returns true if current asset amount lower or equals than param
   * @param {AssetAmount | bigint} assetAmount
   * @returns {boolean}
   */
  lte(assetAmount: AssetAmount | bigint): boolean {
    this.assetAssetAmount(assetAmount, `compare`);

    if (typeof assetAmount === 'bigint') {
      return this.amount <= assetAmount;
    } else {
      return this.amount <= assetAmount.amount;
    }
  }

  /**
   * sum two asset info with same assetInfo
   * @param {bigint | AssetAmount} assetAmount
   * @returns {AssetAmount}
   */
  plus(assetAmount: bigint | AssetAmount): AssetAmount {
    this.assetAssetAmount(assetAmount, 'sum');
    if (typeof assetAmount === 'bigint') {
      return this.withAmount(this.amount + assetAmount);
    }
    return this.withAmount(this.amount + assetAmount.amount);
  }

  /**
   * subtract param from current assetAmount with same asset info
   * @param {bigint | AssetAmount} assetAmount
   * @returns {AssetAmount}
   */
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

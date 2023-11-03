import { Bech32String } from '../../types/types.ts';
import { AssetAmountSet } from '../assetAmountSet/AssetAmountSet.ts';
import { Datum } from '../datum/DatumConstructor.ts';

/**
 * Representation on transaction output
 */
export class Output<D extends Datum<any> | undefined> {
  /**
   * Creates output without datum
   * @param {Bech32String} address
   * @param {AssetAmountSet} userAssetAmountSet
   * @returns {Output<undefined>}
   */
  static createWithoutDatum(
    address: Bech32String,
    userAssetAmountSet: AssetAmountSet,
  ): Output<undefined> {
    return new Output(address, userAssetAmountSet, undefined);
  }

  /**
   * Creates output with datum
   * @param {Bech32String} address
   * @param {AssetAmountSet} userAssetAmountSet
   * @param {D} datum
   * @returns {Output<D>}
   */
  static createWithDatum<D extends Datum<any>>(
    address: Bech32String,
    userAssetAmountSet: AssetAmountSet,
    datum: D,
  ): Output<D> {
    return new Output(address, userAssetAmountSet, datum);
  }
  private constructor(
    public readonly address: Bech32String,
    public readonly userAssetAmountSet: AssetAmountSet,
    public readonly datum: D,
  ) {}
}

import { AssetAmount } from '../../../../../core/models/assetAmount/AssetAmount.ts';
import { AssetInfo } from '../../../../../core/models/assetInfo/AssetInfo.ts';
import { Bech32String } from '../../../../../core/types/types.ts';

export interface SpectrumSwapOutputParams {
  readonly address?: Bech32String;
  readonly changeAddress?: Bech32String;
  readonly nft: AssetInfo;
  readonly base: AssetAmount;
  readonly slippage?: number;
  readonly nitro?: number;
}
/**
 * Representation of spectrum swap output
 */
export class SpectrumSwapOutput {}

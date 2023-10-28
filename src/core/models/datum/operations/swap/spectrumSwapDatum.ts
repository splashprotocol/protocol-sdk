import { Datum } from '../../Datum.ts';
import { SpectrumAssetInfoDatumType } from '../../types/SpectrumAssetInfoDatumType/SpectrumAssetInfoDatumType.ts';
import { SpectrumBigIntDatumType } from '../../types/SpectrumBigIntDatumType/SpectrumBigIntDatumType.ts';
import { SpectrumDatumByteHexString } from '../../types/SpectrumDatumByteHexString/SpectrumDatumByteHexString.ts';
import { SpectrumIntDatumType } from '../../types/SpectrumIntDatumType/SpectrumIntDatumType.ts';
import { SpectrumDatumOptionalType } from '../../types/StectrumDatumOptionalType/SpectrumDatumOptionalType.ts';

export const SpectrumSwapDatum = new Datum({
  // Base asset info
  base: [0, SpectrumAssetInfoDatumType],
  // Quote asset info
  quote: [1, SpectrumAssetInfoDatumType],
  // Pool nft info
  poolNft: [2, SpectrumAssetInfoDatumType],
  // Pool fee num
  feeNum: [3, SpectrumIntDatumType],
  // Execution fee numerator (exFeePerTokenNum / exFeePerTokenDenom = exFeePerToken where exFeePerToken = maxExFee / minQuoteAmount where maxExFee = 1.5 * nitro)
  feePerTokenNum: [4, SpectrumBigIntDatumType],
  // Execution fee denominator (exFeePerTokenNum / exFeePerTokenDenom = exFeePerToken where exFeePerToken = maxExFee / minQuoteAmount where maxExFee = 1.5 * nitro)
  feePerTokenDen: [5, SpectrumBigIntDatumType],
  // Pkh of user address
  rewardPkh: [6, SpectrumDatumByteHexString],
  // Skh of user address
  stakePkh: [7, SpectrumDatumOptionalType(SpectrumDatumByteHexString)],
  // base asset info amount
  baseAmount: [8, SpectrumBigIntDatumType],
  // quote asset info minimal amount
  minQuoteAmount: [9, SpectrumBigIntDatumType],
});

import {
  Datum,
  spectrumDatumPostHandler,
} from '../../../core/models/datum/Datum.ts';
import { SpectrumAssetInfoDatumType } from '../../../core/models/datum/types/SpectrumAssetInfoDatumType/SpectrumAssetInfoDatumType.ts';
import { SpectrumBigIntDatumType } from '../../../core/models/datum/types/SpectrumBigIntDatumType/SpectrumBigIntDatumType.ts';
import { SpectrumDatumByteHexString } from '../../../core/models/datum/types/SpectrumDatumByteHexString/SpectrumDatumByteHexString.ts';
import { SpectrumIntDatumType } from '../../../core/models/datum/types/SpectrumIntDatumType/SpectrumIntDatumType.ts';
import { SpectrumDatumOptionalType } from '../../../core/models/datum/types/StectrumDatumOptionalType/SpectrumDatumOptionalType.ts';

export const SpectrumSwapDatum = new Datum(
  {
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
  },
  spectrumDatumPostHandler,
);

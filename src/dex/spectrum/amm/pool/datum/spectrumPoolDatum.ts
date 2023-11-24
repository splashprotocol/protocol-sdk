import {
  DatumConstructor,
  spectrumDatumPostHandler,
} from '../../../../../core/models/datum/DatumConstructor.ts';
import { SpectrumAssetInfoDatumType } from '../../../../../core/models/datum/types/SpectrumAssetInfoDatumType/SpectrumAssetInfoDatumType.ts';
import { SpectrumDatumByteHexString } from '../../../../../core/models/datum/types/SpectrumDatumByteHexString/SpectrumDatumByteHexString.ts';
import { SpectrumDatumListType } from '../../../../../core/models/datum/types/SpectrumDatumListType/SpectrumDatumListType.ts';
import { SpectrumIntDatumType } from '../../../../../core/models/datum/types/SpectrumIntDatumType/SpectrumIntDatumType.ts';

export const SpectrumPoolDatum = new DatumConstructor(
  {
    // nft asset info
    nft: [0, SpectrumAssetInfoDatumType],
    // x asset info
    x: [1, SpectrumAssetInfoDatumType],
    // y asset info
    y: [2, SpectrumAssetInfoDatumType],
    // lq asset info
    lq: [3, SpectrumAssetInfoDatumType],
    // Pool fee num
    feeNum: [4, SpectrumIntDatumType],
    // list of admin policies
    adminPolicy: [5, SpectrumDatumListType(SpectrumDatumByteHexString)],
    // minimum lq value in pool to unlock swap,
    lqBound: [6, SpectrumIntDatumType],
  },
  spectrumDatumPostHandler,
);

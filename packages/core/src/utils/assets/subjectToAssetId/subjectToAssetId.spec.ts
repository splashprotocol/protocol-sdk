import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { subjectToAssetId } from './subjectToAssetId.ts';

test('it should returns valid assetId for ada', () => {
  expect(subjectToAssetId(AssetInfo.ada.subject)).toBe(AssetInfo.ada.assetId);
});

test('it should returns valid subject for splash', () => {
  expect(subjectToAssetId(AssetInfo.splash.subject)).toBe(
    AssetInfo.splash.assetId,
  );
});

test('it should returns valid subject for spf', () => {
  expect(subjectToAssetId(AssetInfo.spf.subject)).toBe(AssetInfo.spf.assetId);
});

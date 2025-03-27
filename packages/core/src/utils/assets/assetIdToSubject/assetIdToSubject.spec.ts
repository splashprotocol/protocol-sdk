import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { assetIdToSubject } from './assetIdToSubject.ts';

test('it should returns valid subject for ada', () => {
  expect(assetIdToSubject(AssetInfo.ada.assetId)).toBe(AssetInfo.ada.subject);
});

test('it should returns valid subject for splash', () => {
  expect(assetIdToSubject(AssetInfo.splash.assetId)).toBe(
    AssetInfo.splash.subject,
  );
});

test('it should returns valid subject for spf', () => {
  expect(assetIdToSubject(AssetInfo.spf.assetId)).toBe(AssetInfo.spf.subject);
});

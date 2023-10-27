import { adaAssetInfo } from '../assetInfo/adaAssetInfo.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';

test('Encode/decode Value', () => {
  expect(adaAssetInfo.spectrumId).toBe(
    AssetInfo.fromNameString('', '').spectrumId,
  );
});

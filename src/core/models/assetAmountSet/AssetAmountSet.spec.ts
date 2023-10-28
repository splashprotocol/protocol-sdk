import { Value } from '@emurgo/cardano-serialization-lib-browser';

import { AssetAmount } from '../assetAmount/AssetAmount.ts';
import { adaAssetInfo } from '../assetInfo/adaAssetInfo.ts';
import { spfAssetInfo } from '../assetInfo/spfAssetInfo.ts';
import { AssetAmountSet } from './AssetAmountSet.ts';

const cbor =
  '821a02afaf67b827581c026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570a15820d3fa234216901b0aa58a87cd93de69b5fef1d180a7b8cb739a74cedf54c97f011a0013c4c5581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75a1435350461a002f55f0581c0f0f226073e047e71f91686ea26b472d56e8df331874c5fe3bb66132a14b414749585f4144415f4c511a021c3864581c1179e665205965c903a5ae370083db4cb956b3ee68b626605adf845aa14b4d454c445f4144415f4c511a0010da93581c25f0fc240e91bd95dcdaebd2ba7713fc5168ac77234a3d79449fc20ca147534f43494554591a0100141d581c29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6a1434d494e190526581c2adf188218a66847024664f4f63939577627a56c090f679fe366c5eea146535441424c451a0006c578581c318847394ec6842e1069f93c4b3641418a128ab57a97fcca520c7ff2a144574554481a003265b0581c3807e8461adbf6c8cac0b91f6cafdefb6ad2b0d9bf96d5f0e48b7489a14f43617264616e6f50756e6b3233383601581c3a2a9affeed8376411dc7c42e4c0db52e85f65762d3328abe3969b98a14d53554e4441455f4144415f4c511a174f9821581c449b78b977de3bd0bdf66d58d9e28e14762aad9cf1a80c2c3d2e7912a1494c515f4144415f4c511a00113620581c475362a850bf8d1f037794432cdea9fdbbf8d048a7c5115feeb7e91da14b696274635f4144415f4c5119b0f9581c4f2a93e7e89d2db75ade14859a0002a8debb25b877145099c32b6ed4a144554546411a002dc6c0581c51a5e236c4de3af2b8020442e2a26f454fda3b04cb621c1294a0ef34a144424f4f4b1a0199450b581c533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0a144494e44591a0001ac95581c586c476d22fdff736e0b399485eb9fb9803a941b0b676f1b4c8d7c43a14445444f541a00030517581c5ac3d4bdca238105a040a565e5d7e734b7c9e1630aec7650e809e34aa64570757070791b0000008bac4086bd466e65775f6c711a0012b6a947666c6f776572731b0000008d0b19f994476e65775f6e66740848676f6c64666973681a0bb62c024c4144415f20534e454b5f4c5119633b581c5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114a1434941471a00339d73581c642fa782e43dc61d4eb28de5c14899d92a4302aefe167942a6c04809a14d535441424c455f4144415f4c51191388581c643152c83451db1298cefbfef02abe0bd81c27046d6ccda60042d4bea1494c515f4144415f4c511a0034a771581c6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d10a1444d454c441a009c32c8581c74f47c99ac793c29280575b08fe20c7fb75543bff5b1581f7c162e7ca14a5350465f4144415f4c511a183a2f14581c8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61a14c446a65644d6963726f5553441a0003ee4a581c8f6a8c48f10c1bd667845bc3a4832316f00758d413e56fb3e62613b4a14d746573745f737065637472756d1b00038d7ea4c68000581c8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f69587a144414144411a000333bf581c95a427e384527065f2f8946f5e86320d0117839a5e98ea2c0b55fb00a14448554e541a013b2099581c98322ea67ebfbfd9984db16ad94e6683f1d58151cd1a7cb588d81700a15157696e675269646572735f4144415f4c511a02bf5069581c9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77a14653554e4441451a10a4ddc6581c9e761c0bd753da57c4602c87028fe73b43353dfdc613a84d9c6dcceda14e534f43494554595f4144415f4c511a000f4240581ca780d696f101b64dd436a3c419c8c7742d3047f605d60f28837b0abea14a4941475f4144415f4c511a00303884581cc0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d5073a14a57696e675269646572731a02f249df581ccfd784ccfe5fe8ce7d09f4ddb65624378cc8022bf3ec240cf41ea6bea15143617264616e6f546f6b656e76546573741b0000000165a0bc00581cdda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fba1480014df1047454e531a00d42a68581ce3ff4ab89245ede61b3e2beab0443dbcc7ea8ca2c017478e4e8990e2a14974617070793332373401581cef6aa6200e21634e58ce6796b4b61d1d7d059d2ebe93c2996eeaf286a14b52737445524776546573741a02f9b800581cefd7bd84c73fa01400d3c892365ce90b203981aab678bcffb6f3406aa148353331303932363701581cf0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9aa5456f736b696e01457269646c65014874657374657230310149735f5f746573743031014a7961736861626c61636b01581cf66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880a14469425443190369581cfbae99b8679369079a7f6f0da14a2cf1c2d6bfd3afdf3a96a64ab67aa1490014df1047454e53581a0311038c';

test('it should create valid instance of AssetAmountSet from array', () => {
  const assetAmountSet = new AssetAmountSet([
    new AssetAmount(1n, spfAssetInfo),
  ]);
  expect(assetAmountSet).toBeInstanceOf(AssetAmountSet);
});

test('it should create valid instance of AssetAmountSet from cbor', () => {
  expect(AssetAmountSet.fromCborHex(cbor)).toBeInstanceOf(AssetAmountSet);
});

test('it should create valid instance of AssetAmountSet from wasm value', () => {
  expect(AssetAmountSet.fromWasmValue(Value.from_hex(cbor))).toBeInstanceOf(
    AssetAmountSet,
  );
});

test('it should get ada asset amount', () => {
  const assetAmountSet = AssetAmountSet.fromCborHex(cbor);
  const adaAmount = assetAmountSet.getAda();

  expect(adaAmount?.amount).toBe(45068135n);
  expect(adaAmount?.assetInfo.spectrumId).toBe(adaAssetInfo.spectrumId);
});

test('it should get spf asset amount', () => {
  const assetAmountSet = AssetAmountSet.fromCborHex(cbor);
  const spfAmount = assetAmountSet.getSpf();

  expect(spfAmount?.amount).toBe(3102192n);
  expect(spfAmount?.assetInfo.spectrumId).toBe(spfAssetInfo.spectrumId);
});

test('it should get asset amount by asset info', () => {
  const assetAmountSet = AssetAmountSet.fromCborHex(cbor);
  const spfAmount = assetAmountSet.get(spfAssetInfo);
  const adaAmount = assetAmountSet.get(adaAssetInfo);

  expect(spfAmount?.amount).toBe(3102192n);
  expect(spfAmount?.assetInfo.spectrumId).toBe(spfAssetInfo.spectrumId);

  expect(adaAmount?.amount).toBe(45068135n);
  expect(adaAmount?.assetInfo.spectrumId).toBe(adaAssetInfo.spectrumId);
});

test('it should return valid cbor', () => {
  const assetAmountSet = AssetAmountSet.fromCborHex(cbor);

  expect(assetAmountSet.toCborHex()).toBe(cbor);
});

test('it should return valid wasm Value instance', () => {
  const assetAmountSet = AssetAmountSet.fromCborHex(cbor);

  expect(assetAmountSet.toWasmValue()).toBeInstanceOf(Value);
});

test('it should sum 2 sets with different assets', () => {
  const set1 = new AssetAmountSet([AssetAmount.adaAssetAmount(4n)]);
  const set2 = new AssetAmountSet([AssetAmount.spfAssetAmount(3n)]);
  const sum = set1.plus(set2);

  expect(sum).toBeInstanceOf(AssetAmountSet);
  expect(sum.getSpf()?.amount).toBe(3n);
  expect(sum.getAda()?.amount).toBe(4n);
});

test('it should sum 2 sets with same assets', () => {
  const set1 = new AssetAmountSet([AssetAmount.adaAssetAmount(4n)]);
  const set2 = new AssetAmountSet([AssetAmount.adaAssetAmount(3n)]);
  const sum = set1.plus(set2);

  expect(sum).toBeInstanceOf(AssetAmountSet);
  expect(sum.getAda()?.amount).toBe(7n);
});

test('it should subtract set2 from set1', () => {
  const set1 = new AssetAmountSet([AssetAmount.adaAssetAmount(4n)]);
  const set2 = new AssetAmountSet([AssetAmount.adaAssetAmount(3n)]);
  const minusRes = set1.minus(set2);

  expect(minusRes).toBeInstanceOf(AssetAmountSet);
  expect(minusRes.getAda()?.amount).toBe(1n);
});

test('it should throws error after subtract same assets method call', () => {
  const set1 = new AssetAmountSet([AssetAmount.adaAssetAmount(4n)]);
  const set2 = new AssetAmountSet([AssetAmount.adaAssetAmount(3n)]);

  try {
    set2.minus(set1);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should throws error after subtract different assets method call', () => {
  const set1 = new AssetAmountSet([AssetAmount.spfAssetAmount(4n)]);
  const set2 = new AssetAmountSet([AssetAmount.adaAssetAmount(3n)]);

  try {
    set2.minus(set1);
  } catch (error) {
    expect(error).toBe(error);
  }
});

test('it should returns true after isAssetsEnough method call', () => {
  const set1 = new AssetAmountSet([AssetAmount.adaAssetAmount(4n)]);
  const set2 = new AssetAmountSet([AssetAmount.adaAssetAmount(3n)]);

  expect(set1.isAssetsEnough(set2)).toBe(true);
});

test('it should returns false after isAssetsEnough method call', () => {
  const set1 = new AssetAmountSet([AssetAmount.adaAssetAmount(4n)]);
  const set2 = new AssetAmountSet([AssetAmount.adaAssetAmount(3n)]);

  expect(set2.isAssetsEnough(set1)).toBe(false);
});

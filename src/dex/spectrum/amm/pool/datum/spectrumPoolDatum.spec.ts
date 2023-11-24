// import { adaAssetInfo } from '../../../core/models/assetInfo/adaAssetInfo.ts';
// import { AssetInfo } from '../../../core/models/assetInfo/AssetInfo.ts';
// import { spfAssetInfo } from '../../../core/models/assetInfo/spfAssetInfo.ts';

// const datumValue = {
//   base: adaAssetInfo,
//   quote: spfAssetInfo,
//   poolNft: AssetInfo.fromNameCborHex(
//     'a80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf',
//     '4b5350465f4144415f4e4654',
//   ),
//   feeNum: 997,
//   feePerTokenDen: 100000000000000000n,
//   feePerTokenNum: 27050563454219895n,
//   minQuoteAmount: 5545171n,
//   baseAmount: 1000000n,
//   rewardPkh: '64d09f62dfd32dd6f5951bb51dae51507b44cf4690297d76c4e29384',
//   stakePkh: '309d09ab1bb48502ac52a2ec6ecadbf6dd6f91d5faebf94350ad9b43',
// };

test('it should create valid pd from object', () => {
  // const expectedHex =
  //   'd8799fd8799f4040ffd8799f581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e7543535046ffd8799f581ca80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf4b5350465f4144415f4e4654ff1903e51b00601a5819a9b6771b016345785d8a0000581c64d09f62dfd32dd6f5951bb51dae51507b44cf4690297d76c4e29384d8799f581c309d09ab1bb48502ac52a2ec6ecadbf6dd6f91d5faebf94350ad9b43ff1a000f42401a00549cd3ff';
  //
  // expect(SpectrumPoolDatum.serialize(datumValue).to_hex()).toBe(expectedHex);
});

import { AssetInfo } from '../../../core/models/assetInfo/AssetInfo.ts';
import { SpectrumSwapDatum } from './spectrumSwapDatum.ts';

const poolTokens = {
  nft: AssetInfo.fromNameHex('6e6674', '48706f6f6c5f6e6674'),
  x: AssetInfo.fromNameHex('78', '46706f6f6c5f78'),
  y: AssetInfo.fromNameHex('79', '46706f6f6c5f79'),
};
const poolFeeNum = 995;
const rewardPkh = 'd74d26c5029cf290094fce1a0670da7369b9026571dfb977c6fa234f';
const datumValue = {
  base: poolTokens.x,
  quote: poolTokens.y,
  poolNft: poolTokens.nft,
  feeNum: poolFeeNum,
  feePerTokenDen: 1n,
  feePerTokenNum: 2500000n,
  minQuoteAmount: 1n,
  baseAmount: 2n,
  rewardPkh: rewardPkh,
  stakePkh: undefined,
};

test('it should create valid pd from object', () => {
  const expectedHex =
    'd8799fd8799f417846706f6f6c5f78ffd8799f417946706f6f6c5f79ffd8799f436e6674' +
    '48706f6f6c5f6e6674ff1903e31a002625a001581cd74d26c5029cf290094fce1a0670da' +
    '7369b9026571dfb977c6fa234fd87a800201ff';

  expect(SpectrumSwapDatum.serialize(datumValue).to_hex()).toBe(expectedHex);
});

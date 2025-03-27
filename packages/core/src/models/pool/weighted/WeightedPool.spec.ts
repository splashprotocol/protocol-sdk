import { Currency } from '../../currency/Currency.ts';
import { AssetInfo } from '../../assetInfo/AssetInfo.ts';
import { WeightedPool } from './WeightedPool.ts';

const weightedPool = WeightedPool.new({
  xWeight: 1,
  yWeight: 4,
  outputId: {
    txHash: '9c2f50da2919ac6d871c3d21cc9ae2efc531a8af7de7e25ced180c28df81fc3f',
    index: 1n,
  },
  totalX: Currency.ada(573169725809n),
  totalY: Currency.new(
    303830481774500n,
    AssetInfo.fromAssetId(
      '04b95368393c821f180deee8229fbd941baaf9bd748ebcdbf7adbb14.7273455247',
    ),
  ),
  treasuryY: 903207944848n,
  treasuryX: 1847568584n,
  treasuryFee: 90n,
  tvlADA: 1140522383598n,
  tvlUSD: 404080459076n,
  volumeUSD: 3440898448n,
  volumeADA: 9711980897n,
  lpFeeADA: 78667045n,
  lpFeeUSD: 27871277n,
  apr: 2.52,
  xFee: 99100n,
  yFee: 99100n,
  nft: AssetInfo.fromAssetId(
    '5cb6e093f8a900f82ad299c807511b9faf2273adbac58cf4a35a4c99.72734552475f4144415f4e4654',
  ),
  lq: Currency.new(
    9223359309289794495n,
    AssetInfo.fromAssetId(
      '84e481732b09cef3a4e13b4cae97630fc680dce0429691432f07b2ba.72734552475f4144415f4c51',
    ),
  ),
});

test('it should be instance of CfmmPool', () => {
  expect(weightedPool).toBeInstanceOf(WeightedPool);
});

test('it should returns valid cfmmPool type', () => {
  expect(weightedPool.type).toBe('weighted');
  expect(weightedPool.xWeight).toBe(1);
  expect(weightedPool.yWeight).toBe(4);
  expect(weightedPool.feeDenominator).toBe(100000n);
});

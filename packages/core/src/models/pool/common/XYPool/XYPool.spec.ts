import { Currency } from '../../../currency/Currency.ts';
import { AssetInfo } from '../../../assetInfo/AssetInfo.ts';
import { XYPool } from './XYPool.ts';

// @ts-ignore
const xyPool = new XYPool({
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
  feeDenominator: 100000n,
  type: 'cfmm',
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
  expect(xyPool).toBeInstanceOf(XYPool);
});

test('It should returns valid property values', () => {
  expect(xyPool.outputId.txHash).toBe(
    '9c2f50da2919ac6d871c3d21cc9ae2efc531a8af7de7e25ced180c28df81fc3f',
  );
  expect(xyPool.outputId.index).toBe(1n);

  expect(xyPool.totalX.amount).toBe(573169725809n);
  expect(xyPool.totalX.asset.name).toBe('');

  expect(xyPool.totalY.amount).toBe(303830481774500n);
  expect(xyPool.totalY.asset.name).toBe('rsERG');

  expect(xyPool.treasuryX.amount).toBe(1847568584n);
  expect(xyPool.totalX.asset.name).toBe('');

  expect(xyPool.treasuryY.amount).toBe(903207944848n);
  expect(xyPool.treasuryY.asset.name).toBe('rsERG');

  expect(xyPool.x.amount).toBe(573169725809n - 1847568584n);
  expect(xyPool.x.asset.name).toBe('');

  expect(xyPool.y.amount).toBe(303830481774500n - 903207944848n);
  expect(xyPool.y.asset.name).toBe('rsERG');

  expect(xyPool.xFeeNumerator).toBe(99100n);
  expect(xyPool.xFee).toBe(0.9);

  expect(xyPool.treasuryFeeNumerator).toBe(90n);
  expect(xyPool.treasuryFee).toBe(0.09);

  expect(xyPool.lq.amount).toBe(9223359309289794495n);
  expect(xyPool.lq.asset.name).toBe('rsERG_ADA_LQ');

  expect(xyPool.nft.name).toBe('rsERG_ADA_NFT');
  expect(xyPool.id).toBe(xyPool.nft.assetId);

  const necessaryRsErg = xyPool.getAnotherAssetForDeposit(
    Currency.ada(1000000n),
  );
  expect(necessaryRsErg).toBeInstanceOf(Currency);
  expect(necessaryRsErg.asset.name).toBe('rsERG');
  expect(necessaryRsErg.amount).toBe(530221470n);

  const necessaryAda = xyPool.getAnotherAssetForDeposit(necessaryRsErg);
  expect(necessaryAda).toBeInstanceOf(Currency);
  expect(necessaryAda.asset.name).toBe('');
  expect(necessaryAda.amount).toBe(1000000n);

  const expectedLq = xyPool.convertAssetsToLp({
    x: Currency.ada(1000000n),
    y: xyPool.y.withAmount(530212239n),
  });

  expect(expectedLq).toBeInstanceOf(Currency);
  expect(expectedLq.amount).toBe(22276999n);
  expect(expectedLq.asset.name).toBe('rsERG_ADA_LQ');

  const expectedXY = xyPool.convertLpToAssets(expectedLq);

  expect(expectedXY.x).toBeInstanceOf(Currency);
  expect(expectedXY.x.amount).toBe(999982n);
  expect(expectedXY.x.asset.name).toBe('');

  expect(expectedXY.y).toBeInstanceOf(Currency);
  expect(expectedXY.y.amount).toBe(530212227n);
  expect(expectedXY.y.asset.name).toBe('rsERG');
});

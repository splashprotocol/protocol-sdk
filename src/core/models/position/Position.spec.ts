import { SplashApi } from '../../../splash/api/splash/SplashApi.ts';
import { Splash } from '../../../splash/splash.ts';
import { AssetInfo } from '../assetInfo/AssetInfo.ts';
import { Currency } from '../currency/Currency.ts';
import { CfmmPool } from '../pool/cfmm/CfmmPool.ts';
import { Position } from './Position.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet');

const cfmmPool = CfmmPool.new(
  {
    cfmmType: 'feeSwitch',
    totalX: Currency.ada(20000000n),
    totalY: Currency.spf(20000000n),
    treasuryY: 15n,
    treasuryX: 10n,
    outputId: { txHash: '', index: 0n },
    tvlADA: 334925.440093,
    tvlUSD: 334925.44,
    volumeUSD: 2274.49,
    volumeADA: 2274.497363,
    apr: 20,
    xFee: 97000n,
    yFee: 97000n,
    nft: AssetInfo.new({
      policyId: 'a80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf',
      name: 'SPF_ADA_NFT',
      type: 'raw',
    }),
    lq: Currency.new(
      651595813869n,
      AssetInfo.new({
        policyId: '74f47c99ac793c29280575b08fe20c7fb75543bff5b1581f7c162e7c',
        name: 'SPF_ADA_LQ',
        type: 'raw',
      }),
    ),
  },
  splash,
);

test('it should create empty instance of position', () => {
  const position = Position.empty(cfmmPool, splash);

  expect(position).toBeInstanceOf(Position);
  expect(position.pool).toBe(cfmmPool);
  expect(position.lq.asset.splashId).toBe(cfmmPool.lq.asset.splashId);
  expect(position.lq.amount).toBe(0n);
  expect(position.assets.x.amount).toBe(0n);
  expect(position.assets.y.amount).toBe(0n);
  expect(position.availableAssets.x.amount).toBe(0n);
  expect(position.availableAssets.y.amount).toBe(0n);
});

test('it should create instance of position with amount', () => {
  const position = Position.new(
    {
      pool: cfmmPool,
      lq: cfmmPool.lq.withAmount(1000000000000000n),
    },
    splash,
  );

  expect(position).toBeInstanceOf(Position);
  expect(position.pool).toBe(cfmmPool);
  expect(position.lq.asset.splashId).toBe(cfmmPool.lq.asset.splashId);
  expect(position.lq.amount).toBe(1000000000000000n);
  expect(position.assets.x.amount !== 0n).toBe(true);
  expect(position.assets.y.amount !== 0n).toBe(true);
  expect(position.availableAssets.x.amount !== 0n).toBe(true);
  expect(position.availableAssets.y.amount !== 0n).toBe(true);
});

test('it should throws error if lq assets are now equal', () => {
  try {
    Position.new(
      {
        pool: cfmmPool,
        lq: Currency.ada(10n),
      },
      splash,
    );
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

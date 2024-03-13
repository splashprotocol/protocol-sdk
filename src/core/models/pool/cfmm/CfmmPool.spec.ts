import { SplashApi } from '../../../../splash/api/splash/SplashApi.ts';
import { Splash } from '../../../../splash/splash.ts';
import { ada } from '../../assetInfo/ada.ts';
import { AssetInfo } from '../../assetInfo/AssetInfo.ts';
import { spf } from '../../assetInfo/spf.ts';
import { usd } from '../../assetInfo/usd.ts';
import { Currency } from '../../currency/Currency.ts';
import { CfmmPool } from './CfmmPool.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet');

const cfmmPool = CfmmPool.new(
  {
    cfmmType: 'feeSwitch',
    totalX: Currency.ada(20000000n),
    totalY: Currency.spf(20000000n),
    treasuryY: 15n,
    treasuryX: 10n,
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

test('it should be instance of CfmmPool', () => {
  expect(cfmmPool).toBeInstanceOf(CfmmPool);
});

test('it should returns valid cfmmPool type', () => {
  expect(cfmmPool.cfmmType).toBe('feeSwitch');
});

test('it should returns valid total x and total y', () => {
  expect(cfmmPool.totalX.asset.splashId).toBe(ada.splashId);
  expect(cfmmPool.totalY.asset.splashId).toBe(spf.splashId);
  expect(cfmmPool.totalX.amount).toBe(20000000n);
  expect(cfmmPool.totalY.amount).toBe(20000000n);
});

test('it should returns valid x and y', () => {
  expect(cfmmPool.x.asset.splashId).toBe(ada.splashId);
  expect(cfmmPool.y.asset.splashId).toBe(spf.splashId);
  expect(cfmmPool.x.amount).toBe(20000000n - 10n);
  expect(cfmmPool.y.amount).toBe(20000000n - 15n);
});

test('it should returns valid treasury x and treasury y', () => {
  expect(cfmmPool.treasuryX.asset.splashId).toBe(ada.splashId);
  expect(cfmmPool.treasuryY.asset.splashId).toBe(spf.splashId);
  expect(cfmmPool.treasuryX.amount).toBe(10n);
  expect(cfmmPool.treasuryY.amount).toBe(15n);
});

test('it should returns valid tvl numbers', () => {
  expect(cfmmPool.tvlADA?.asset.splashId).toBe(ada.splashId);
  expect(cfmmPool.tvlUSD?.asset.splashId).toBe(usd.splashId);
  expect(cfmmPool.tvlADA?.amount).toBe(334925440093n);
  expect(cfmmPool.tvlUSD?.amount).toBe(33492544n);
});

test('it should returns valid volume numbers', () => {
  expect(cfmmPool.volumeADA?.asset.splashId).toBe(ada.splashId);
  expect(cfmmPool.volumeUSD?.asset.splashId).toBe(usd.splashId);
  expect(cfmmPool.volumeADA?.amount).toBe(2274497363n);
  expect(cfmmPool.volumeUSD?.amount).toBe(227449n);
});

test('it should returns apr percent', () => {
  expect(cfmmPool.apr).toBe(20);
});

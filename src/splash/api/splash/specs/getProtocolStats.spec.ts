import { ada } from '../../../../core/models/assetInfo/ada.ts';
import { usd } from '../../../../core/models/assetInfo/usd.ts';
import { getDecimalsCount } from '../../../../core/utils/math/math.ts';
import { SplashApi } from '../SplashApi.ts';

test('it should returns valid raw protocol stats', async () => {
  const protocolStats = await SplashApi.new('mainnet').getProtocolStats();

  expect(typeof protocolStats.lpFeeUsd).toBe('number');
  expect(typeof protocolStats.volumeUsd).toBe('number');
  expect(typeof protocolStats.tvlUsd).toBe('number');
  expect(
    getDecimalsCount(protocolStats.lpFeeUsd.toString()),
  ).toBeLessThanOrEqual(usd.decimals);
  expect(
    getDecimalsCount(protocolStats.volumeUsd.toString()),
  ).toBeLessThanOrEqual(usd.decimals);
  expect(getDecimalsCount(protocolStats.tvlUsd.toString())).toBeLessThanOrEqual(
    usd.decimals,
  );

  expect(typeof protocolStats.lpFeesAda).toBe('number');
  expect(typeof protocolStats.volumeAda).toBe('number');
  expect(typeof protocolStats.tvlAda).toBe('number');
  expect(
    getDecimalsCount(protocolStats.lpFeesAda.toString()),
  ).toBeLessThanOrEqual(ada.decimals);
  expect(
    getDecimalsCount(protocolStats.volumeAda.toString()),
  ).toBeLessThanOrEqual(ada.decimals);
  expect(getDecimalsCount(protocolStats.tvlAda.toString())).toBeLessThanOrEqual(
    ada.decimals,
  );
});

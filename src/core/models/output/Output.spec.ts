import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

import { SplashApi } from '../../../splash/api/splash/SplashApi.ts';
import { Currencies } from '../currencies/Currencies.ts';
import { Currency } from '../currency/Currency.ts';
import { Data } from '../data/data.ts';
import { Output } from './Output.ts';

const expectedAddress = `addr1q9lr22dud06hkcp9vyyltag7g6jza27w0j0lhuveajqzmsmcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxscp8ra5`;

test('it should creates output without datum', async () => {
  const pParams = await SplashApi.new('mainnet').getProtocolParams();

  const output = Output.new(pParams, {
    address: expectedAddress,
    value: [Currency.ada(1000000n)],
  });
  console.log(output);
  expect(true).toBe(true);
  expect(output.address).toBe(expectedAddress);
  expect(output.userValue).toBeInstanceOf(Currencies);
  expect(output.data).toBe(undefined);
});

test('it should creates output with datum', async () => {
  const pParams = await SplashApi.new('mainnet').getProtocolParams();
  const output = Output.new(pParams, {
    address: expectedAddress,
    data: Data.Int(1),
    value: [Currency.ada(1000000n)],
  });

  expect(output).toBeInstanceOf(Output);
  expect(output.address).toBe(expectedAddress);
  expect(output.userValue).toBeInstanceOf(Currencies);
  expect(output.data).toBeInstanceOf(PlutusData);
});

test('it should returns asset amount set with ada only', async () => {
  const pParams = await SplashApi.new('mainnet').getProtocolParams();
  const output = Output.new(pParams, {
    address: expectedAddress,
    value: [Currency.ada(2000000n)],
  });

  expect(output.totalValue.toArray().length).toBe(1);
  expect(output.totalValue.ada?.amount).toBe(2000000n);
  expect(output.isUserValueCoverMinAdaRequired).toBe(true);
});

test('it should returns asset amount set with spf and ada', async () => {
  const pParams = await SplashApi.new('mainnet').getProtocolParams();
  const output = Output.new(pParams, {
    address: expectedAddress,
    value: [Currency.spf(2000000n)],
  });

  expect(output.totalValue.toArray().length).toBe(2);
  expect(typeof output.totalValue.ada?.amount).toBe('bigint');
  expect(output.isUserValueCoverMinAdaRequired).toBe(false);
});

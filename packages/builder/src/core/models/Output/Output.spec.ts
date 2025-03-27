import { createApi, SplashBackend } from '@splashprotocol/api';
import { Output } from './Output.ts';
import { Currencies, Currency } from '@splashprotocol/core';
import { Datum } from '../Datum/Datum.ts';

const expectedAddress = `addr1q9lr22dud06hkcp9vyyltag7g6jza27w0j0lhuveajqzmsmcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxscp8ra5`;

test('it should creates output without datum', async () => {
  const pParams = await createApi(
    SplashBackend.new({ network: 'mainnet' }),
  ).getProtocolParams();

  const output = await Output.new(pParams, {
    address: expectedAddress,
    value: [Currency.ada(1000000n)],
  });
  expect(true).toBe(true);
  expect(output.address).toBe(expectedAddress);
  expect(output.userValue).toBeInstanceOf(Currencies);
  expect(output.data).toBe(undefined);
});

test('it should creates output with datum', async () => {
  const pParams = await createApi(
    SplashBackend.new({ network: 'mainnet' }),
  ).getProtocolParams();
  const output = await Output.new(pParams, {
    address: expectedAddress,
    data: await Datum.integer().serialize(1n),
    value: [Currency.ada(1000000n)],
  });

  expect(output).toBeInstanceOf(Output);
  expect(output.address).toBe(expectedAddress);
  expect(output.userValue).toBeInstanceOf(Currencies);
  expect(typeof output.data).toBe('string');
});

test('it should returns asset amount set with ada only', async () => {
  const pParams = await createApi(
    SplashBackend.new({ network: 'mainnet' }),
  ).getProtocolParams();
  const output = await Output.new(pParams, {
    address: expectedAddress,
    value: [Currency.ada(2000000n)],
  });

  expect(output.totalValue.toArray().length).toBe(1);
  expect(output.totalValue.ada?.amount).toBe(2000000n);
  expect(output.isUserValueCoverMinAdaRequired).toBe(true);
});

test('it should returns asset amount set with spf and ada', async () => {
  const pParams = await createApi(
    SplashBackend.new({ network: 'mainnet' }),
  ).getProtocolParams();
  const output = await Output.new(pParams, {
    address: expectedAddress,
    value: [Currency.spf(2000000n)],
  });

  expect(output.totalValue.toArray().length).toBe(2);
  expect(typeof output.totalValue.ada?.amount).toBe('bigint');
  expect(output.isUserValueCoverMinAdaRequired).toBe(false);
});

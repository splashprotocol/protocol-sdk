import { Currencies } from '../../core/models/currencies/Currencies.ts';
import { Currency } from '../../core/models/currency/Currency.ts';
import { SplashApi } from '../api/splash/SplashApi.ts';
import { Splash } from '../splash.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet');

test('it should returns valid tx builder', () => {
  const txBuilder = splash.newTx();

  expect(txBuilder.payToContract).toBeInstanceOf(Function);
  expect(txBuilder.payToAddress).toBeInstanceOf(Function);
  expect(txBuilder.queue.length).toBe(0);
});

const expectedAddress = `addr1q9lr22dud06hkcp9vyyltag7g6jza27w0j0lhuveajqzmsmcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxscp8ra5`;

test('it should returns valid chaining and save operation to queue', () => {
  const txBuilder = splash
    .newTx()
    .payToAddress(expectedAddress, [Currency.ada(2000000n)]);

  expect(txBuilder.payToContract).toBeInstanceOf(Function);
  expect(txBuilder.payToAddress).toBeInstanceOf(Function);
  expect(txBuilder.queue.length).toBe(1);
});

test('it should be immutable', () => {
  const tx1Builder = splash.newTx();
  const tx2Builder = tx1Builder.payToAddress(expectedAddress, [
    Currency.ada(2000000n),
  ]);
  const tx3Builder = tx2Builder.payToAddress(expectedAddress, [
    Currency.ada(2000000n),
  ]);

  expect(tx1Builder.payToContract).toBeInstanceOf(Function);
  expect(tx1Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx1Builder.queue.length).toBe(0);

  expect(tx2Builder.payToContract).toBeInstanceOf(Function);
  expect(tx2Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx2Builder.queue.length).toBe(1);

  expect(tx3Builder.payToContract).toBeInstanceOf(Function);
  expect(tx3Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx3Builder.queue.length).toBe(2);
});

test('it should create wasm transaction', async () => {
  const tx = await splash
    .newTx()
    .payToAddress(
      'addr1q9cehmjzf2tmtzeae2y0uhdxl6kxf992wgn0ja0n2pk9kftcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxsqwq3mt',
      Currencies.new([Currency.ada(1000n)]),
    )
    .complete();
  console.log(tx);
});

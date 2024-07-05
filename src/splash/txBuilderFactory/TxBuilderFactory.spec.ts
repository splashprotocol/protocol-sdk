import { cip30Bridge } from '../../../jest/cip30BridgeEmulator.ts';
import { AssetInfo } from '../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../core/models/currency/Currency.ts';
import { Price } from '../../core/models/price/Price.ts';
import { Transaction } from '../../core/models/transaction/Transaction.ts';
import { SplashApi } from '../api/splash/SplashApi.ts';
import { Splash } from '../splash.ts';

const splash = Splash.new(SplashApi.new('mainnet'), 'mainnet');
splash.selectWallet(cip30Bridge);

test('it should returns valid tx builder', () => {
  const txBuilder = splash.newTx();

  expect(txBuilder.payToContract).toBeInstanceOf(Function);
  expect(txBuilder.payToAddress).toBeInstanceOf(Function);
  expect(txBuilder.tasks.length).toBe(0);
});

const expectedAddress = `addr1q9lr22dud06hkcp9vyyltag7g6jza27w0j0lhuveajqzmsmcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxscp8ra5`;

test('it should returns valid chaining and save operation to tasks', () => {
  const txBuilder = splash
    .newTx()
    .payToAddress(expectedAddress, [Currency.ada(2000000n)]);

  expect(txBuilder.payToContract).toBeInstanceOf(Function);
  expect(txBuilder.payToAddress).toBeInstanceOf(Function);
  expect(txBuilder.tasks.length).toBe(1);
});

test('it should be mutable', () => {
  const tx1Builder = splash.newTx();
  const tx2Builder = tx1Builder.payToAddress(expectedAddress, [
    Currency.ada(2000000n),
  ]);
  const tx3Builder = tx2Builder.payToAddress(expectedAddress, [
    Currency.ada(2000000n),
  ]);

  expect(tx1Builder.payToContract).toBeInstanceOf(Function);
  expect(tx1Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx1Builder.tasks.length).toBe(2);

  expect(tx2Builder.payToContract).toBeInstanceOf(Function);
  expect(tx2Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx2Builder.tasks.length).toBe(2);

  expect(tx3Builder.payToContract).toBeInstanceOf(Function);
  expect(tx3Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx3Builder.tasks.length).toBe(2);
});

test('it should create wasm transaction', async () => {
  const someAsset = AssetInfo.new({
    name: '74657374746f6b656e',
    type: 'base16',
    policyId: 'fd10da3e6a578708c877e14b6aaeda8dc3a36f666a346eec52a30b3a',
  });
  const tx = await splash
    .newTx()
    .spotOrder({
      input: Currency.ada(1n),
      outputAsset: someAsset,
      price: Price.new({
        base: AssetInfo.ada,
        quote: someAsset,
        raw: '1000',
      }),
    })
    .complete();

  expect(tx).toBeInstanceOf(Transaction);
});

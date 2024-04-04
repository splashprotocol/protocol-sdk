import { cip30Bridge } from '../../../jest/cip30BridgeEmulator.ts';
import { AssetInfo } from '../../core/models/assetInfo/AssetInfo.ts';
import { Currency } from '../../core/models/currency/Currency.ts';
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
  const tx = await splash
    .newTx()
    .spotOrder({
      input: Currency.ada(10_000n),
      outputAsset: AssetInfo.spf,
    })
    .spotOrder({
      input: Currency.ada(10_000n),
      outputAsset: AssetInfo.spf,
    })
    .complete();

  expect(tx).toBeInstanceOf(Transaction);
});

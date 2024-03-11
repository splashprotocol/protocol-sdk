import { Currency } from '../../core/models/currency/Currency.ts';
import { TxBuilderFactory } from './TxBuilderFactory.ts';

const txBuilderFactory = new TxBuilderFactory('mainnet');

test('it should returns valid tx builder', () => {
  const txBuilder = txBuilderFactory.newTx();

  expect(txBuilder.payToContract).toBeInstanceOf(Function);
  expect(txBuilder.payToAddress).toBeInstanceOf(Function);
  expect(txBuilder.queue.length).toBe(0);
});

const expectedAddress = `addr1q9lr22dud06hkcp9vyyltag7g6jza27w0j0lhuveajqzmsmcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxscp8ra5`;

test('it should returns valid chaining and save operation to queue', () => {
  const txBuilder = txBuilderFactory
    .newTx()
    .payToAddress(expectedAddress, [Currency.ada(2000000n)]);

  expect(txBuilder.payToContract).toBeInstanceOf(Function);
  expect(txBuilder.payToAddress).toBeInstanceOf(Function);
  expect(txBuilder.queue.length).toBe(1);
});

test('it should be immutable', () => {
  const tx1Builder = txBuilderFactory.newTx();
  const tx2Builder = tx1Builder.payToAddress(expectedAddress, [
    Currency.ada(2000000n),
  ]);

  expect(tx1Builder.payToContract).toBeInstanceOf(Function);
  expect(tx1Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx1Builder.queue.length).toBe(0);

  expect(tx2Builder.payToContract).toBeInstanceOf(Function);
  expect(tx1Builder.payToAddress).toBeInstanceOf(Function);
  expect(tx2Builder.queue.length).toBe(1);
});

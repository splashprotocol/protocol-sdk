import { RemoteTransaction } from './RemoteTransaction.ts';
import { builderEmulator } from '../../../mocks/RemoteBuilderEmulator.ts';
import { SignedRemoteTransaction } from '../SignedRemoteTransaction/SignedRemoteTransaction.ts';

test('should creates valid instance of RemoteTransaction', async () => {
  const remoteTransaction = RemoteTransaction.new('unsigned', builderEmulator);

  expect(remoteTransaction).toBeInstanceOf(RemoteTransaction);
  expect(remoteTransaction.serialization).toBe('unsigned');
});

test('sign should returns signed transaction', async () => {
  const remoteTransaction = RemoteTransaction.new('unsigned', builderEmulator);
  const signedRemoteTransaction = await remoteTransaction.sign();

  expect(signedRemoteTransaction).toBeInstanceOf(SignedRemoteTransaction);
  expect(signedRemoteTransaction.serialization).toBe('signed');
});

test('signAndSubmit should returns transaction hash', async () => {
  const remoteTransaction = RemoteTransaction.new('unsigned', builderEmulator);
  const hash = await remoteTransaction.signAndSubmit();

  expect(hash).toBe('submitted');
});

import { builderEmulator } from '../../../mocks/RemoteBuilderEmulator.ts';
import { SignedRemoteTransaction } from './SignedRemoteTransaction.ts';

test('should creates valid instance of SignedRemoteTransaction', () => {
  const signedRemoteTransaction = SignedRemoteTransaction.new(
    'signed',
    builderEmulator,
  );

  expect(signedRemoteTransaction).toBeInstanceOf(SignedRemoteTransaction);
  expect(signedRemoteTransaction.serialization).toBe('signed');
});

test('submit should returns transaction hash', async () => {
  const signedRemoteTransaction = SignedRemoteTransaction.new(
    'signed',
    builderEmulator,
  );

  expect(await signedRemoteTransaction.submit()).toBe('submitted');
});

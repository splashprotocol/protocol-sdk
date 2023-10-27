import { stringToCborBytes } from './stringToCborBytes.ts';

test('it should convert ada name to ada cbor bytes', () => {
  const adaString = '';
  const expectedAdaCborBytes = Uint8Array.from([64]);

  expect(Uint8Array.from(stringToCborBytes(adaString))).toEqual(
    expectedAdaCborBytes,
  );
});

test('it should convert spf name to spf cbor bytes', () => {
  const spfString = 'SPF';
  const expectedSpfCborBytes = Uint8Array.from([67, 83, 80, 70]);

  expect(Uint8Array.from(stringToCborBytes(spfString))).toEqual(
    expectedSpfCborBytes,
  );
});

test('it should convert STABLE name to STABLE cbor bytes', () => {
  const stableString = 'STABLE';
  const expectedStableCborBytes = Uint8Array.from([70, 83, 84, 65, 66, 76, 69]);

  expect(Uint8Array.from(stringToCborBytes(stableString))).toEqual(
    expectedStableCborBytes,
  );
});

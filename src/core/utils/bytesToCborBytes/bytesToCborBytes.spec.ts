import { bytesToCborBytes } from './bytesToCborBytes.ts';

test('it should convert ada bytes to cbor ada bytes', () => {
  const adaBytes = Uint8Array.from([]);
  const expectedAdaCborBytes = Uint8Array.from([64]);

  expect(Uint8Array.from(bytesToCborBytes(adaBytes))).toEqual(
    expectedAdaCborBytes,
  );
});

test('it should convert spf bytes to cbor spf bytes', () => {
  const spfBytes = Uint8Array.from([83, 80, 70]);
  const expectedSpfCborBytes = Uint8Array.from([67, 83, 80, 70]);

  expect(Uint8Array.from(bytesToCborBytes(spfBytes))).toEqual(
    expectedSpfCborBytes,
  );
});

test('it should convert STABLE bytes to cbor STABLE bytes', () => {
  const stableBytes = Uint8Array.from([83, 84, 65, 66, 76, 69]);
  const expectedStableCborBytes = Uint8Array.from([70, 83, 84, 65, 66, 76, 69]);

  expect(Uint8Array.from(bytesToCborBytes(stableBytes))).toEqual(
    expectedStableCborBytes,
  );
});

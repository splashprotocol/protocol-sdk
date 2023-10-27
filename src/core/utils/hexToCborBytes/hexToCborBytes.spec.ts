import { hexToCborBytes } from './hexToCborBytes.ts';

test('it should convert ada hex to ada cbor bytes', () => {
  const adaHex = '';
  const expectedAdaCborBytes = Uint8Array.from([64]);

  expect(Uint8Array.from(hexToCborBytes(adaHex))).toEqual(expectedAdaCborBytes);
});

test('it should convert spf hex to spf cbor bytes', () => {
  const spfHex = '535046';
  const expectedSpfCborBytes = Uint8Array.from([67, 83, 80, 70]);

  expect(Uint8Array.from(hexToCborBytes(spfHex))).toEqual(expectedSpfCborBytes);
});

test('it should convert STABLE hex to STABLE cbor bytes', () => {
  const stableHex = '535441424c45';
  const expectedStableCborBytes = Uint8Array.from([70, 83, 84, 65, 66, 76, 69]);

  expect(Uint8Array.from(hexToCborBytes(stableHex))).toEqual(
    expectedStableCborBytes,
  );
});

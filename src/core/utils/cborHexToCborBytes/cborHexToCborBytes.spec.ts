import { cborHexToCborBytes } from './cborHexToCborBytes.ts';

test('it should convert ada cbor hex to ada cbor bytes', () => {
  const adaCborHex = '40';
  const expectedAdaCborBytes = Uint8Array.from([64]);

  expect(cborHexToCborBytes(adaCborHex)).toEqual(expectedAdaCborBytes);
});

test('it should convert spf cbor hex to spf cbor bytes', () => {
  const spfCborHex = '43535046';
  const expectedSpfCborBytes = Uint8Array.from([67, 83, 80, 70]);

  expect(cborHexToCborBytes(spfCborHex)).toEqual(expectedSpfCborBytes);
});

test('it should convert STABLE cbor hex to STABLE cbor bytes', () => {
  const stableBytes = '46535441424c45';
  const expectedStableCborBytes = Uint8Array.from([70, 83, 84, 65, 66, 76, 69]);

  expect(cborHexToCborBytes(stableBytes)).toEqual(expectedStableCborBytes);
});

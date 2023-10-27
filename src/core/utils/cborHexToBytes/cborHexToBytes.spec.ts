import { cborHexToBytes } from './cborHexToBytes';

test('it should convert ada cbor hex to ada bytes', () => {
  const adaCborHex = '40';
  const expectedAdaBytes = Uint8Array.from([]);

  expect(cborHexToBytes(adaCborHex)).toEqual(expectedAdaBytes);
});

test('it should convert spf cbor hex to spf bytes', () => {
  const spfCborHex = '43535046';
  const expectedSpfBytes = Uint8Array.from([83, 80, 70]);

  expect(cborHexToBytes(spfCborHex)).toEqual(expectedSpfBytes);
});

test('it should convert STABLE cbor hex to STABLE bytes', () => {
  const stableBytes = '46535441424c45';
  const expectedStableString = Uint8Array.from([83, 84, 65, 66, 76, 69]);

  expect(cborHexToBytes(stableBytes)).toEqual(expectedStableString);
});

import { bytesToCborHex } from './bytesToCborHex.ts';

test('it should convert ada bytes to cbor ada hex', () => {
  const adaBytes = Uint8Array.from([]);
  const expectedAdaCborHex = '40';

  expect(bytesToCborHex(adaBytes)).toEqual(expectedAdaCborHex);
});

test('it should convert spf bytes to cbor spf hex', () => {
  const spfBytes = Uint8Array.from([83, 80, 70]);
  const expectedSpfCborHex = '43535046';

  expect(bytesToCborHex(spfBytes)).toEqual(expectedSpfCborHex);
});

test('it should convert STABLE bytes to cbor STABLE hex', () => {
  const stableBytes = Uint8Array.from([83, 84, 65, 66, 76, 69]);
  const expectedStableCborHex = '46535441424c45';

  expect(bytesToCborHex(stableBytes)).toEqual(expectedStableCborHex);
});

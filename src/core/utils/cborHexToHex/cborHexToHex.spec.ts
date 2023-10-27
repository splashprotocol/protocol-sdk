import { cborHexToHex } from './cborHexToHex.ts';

test('it should convert ada cbor hex to ada hex', () => {
  const adaCborHex = '40';
  const expectedAdaHex = '';

  expect(cborHexToHex(adaCborHex)).toEqual(expectedAdaHex);
});

test('it should convert spf cbor hex to spf hex', () => {
  const spfCborHex = '43535046';
  const expectedSpfHex = '535046';

  expect(cborHexToHex(spfCborHex)).toEqual(expectedSpfHex);
});

test('it should convert STABLE cbor hex to STABLE hex', () => {
  const stableHex = '46535441424c45';
  const expectedStableHex = '535441424c45';

  expect(cborHexToHex(stableHex)).toEqual(expectedStableHex);
});

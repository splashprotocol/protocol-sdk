import { cborHexToString } from './cborHexToString.ts';

test('it should convert ada cbor hex to ada hex', () => {
  const adaCborHex = '40';
  const expectedAdaString = '';

  expect(cborHexToString(adaCborHex)).toEqual(expectedAdaString);
});

test('it should convert spf cbor hex to spf hex', () => {
  const spfCborHex = '43535046';
  const expectedSpfString = 'SPF';

  expect(cborHexToString(spfCborHex)).toEqual(expectedSpfString);
});

test('it should convert STABLE cbor hex to STABLE hex', () => {
  const stableCborHex = '46535441424c45';
  const expectedStableString = 'STABLE';

  expect(cborHexToString(stableCborHex)).toEqual(expectedStableString);
});

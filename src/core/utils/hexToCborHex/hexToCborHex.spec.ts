import { hexToCborHex } from './hexToCborHex.ts';

test('it should convert ada hex to ada cbor hex', () => {
  const adaHex = '';
  const expectedAdaCborHex = '40';

  expect(hexToCborHex(adaHex)).toEqual(expectedAdaCborHex);
});

test('it should convert spf hex to spf cbor hex', () => {
  const spfHex = '535046';
  const expectedSpfCborHex = '43535046';

  expect(hexToCborHex(spfHex)).toEqual(expectedSpfCborHex);
});

test('it should convert STABLE hex to STABLE cbor hex', () => {
  const stableHex = '535441424c45';
  const expectedStableCborHex = '46535441424c45';

  expect(hexToCborHex(stableHex)).toEqual(expectedStableCborHex);
});

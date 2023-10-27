import { stringToCborHex } from './stringToCborHex.ts';

test('it should convert ada name to cbor ada hex', () => {
  const adaString = '';
  const expectedAdaCborHex = '40';

  expect(stringToCborHex(adaString)).toEqual(expectedAdaCborHex);
});

test('it should convert spf name to cbor spf hex', () => {
  const spfString = 'SPF';
  const expectedSpfCborHex = '43535046';

  expect(stringToCborHex(spfString)).toEqual(expectedSpfCborHex);
});

test('it should convert STABLE name to cbor STABLE hex', () => {
  const stableString = 'STABLE';
  const expectedStableCborHex = '46535441424c45';

  expect(stringToCborHex(stableString)).toEqual(expectedStableCborHex);
});

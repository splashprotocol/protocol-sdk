import { stringToHex } from './stringToHex.ts';

test('it should convert ada string to ada hex', () => {
  const adaCborString = '';
  const expectedHex = '';

  expect(stringToHex(adaCborString)).toEqual(expectedHex);
});

test('it should convert spf string to spf hex', () => {
  const spfString = 'SPF';
  const expectedSpfHex = '535046';

  expect(stringToHex(spfString)).toEqual(expectedSpfHex);
});

test('it should convert STABLE string to STABLE hex', () => {
  const stableString = 'STABLE';
  const expectedStableHex = '535441424c45';

  expect(stringToHex(stableString)).toEqual(expectedStableHex);
});

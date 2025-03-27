import { hexToString } from './hexToString.ts';

test('it should convert ada hex to ada string', () => {
  const adaCborHex = '';
  const expectedString = '';

  expect(hexToString(adaCborHex)).toEqual(expectedString);
});

test('it should convert spf hex to spf string', () => {
  const spfHex = '535046';
  const expectedSpfString = 'SPF';

  expect(hexToString(spfHex)).toEqual(expectedSpfString);
});

test('it should convert STABLE hex to STABLE string', () => {
  const stableHex = '535441424c45';
  const expectedStableString = 'STABLE';

  expect(hexToString(stableHex)).toEqual(expectedStableString);
});

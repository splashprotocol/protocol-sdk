import { stringToBytes } from './stringToBytes';

test('it should convert ada name to ada bytes', () => {
  const adaString = '';
  const expectedAdaBytes = Uint8Array.from([]);

  expect(stringToBytes(adaString)).toEqual(expectedAdaBytes);
});

test('it should convert spf name to spf bytes', () => {
  const spfString = 'SPF';
  const expectedSpfBytes = Uint8Array.from([83, 80, 70]);

  expect(stringToBytes(spfString)).toEqual(expectedSpfBytes);
});

test('it should convert STABLE name to STABLE bytes', () => {
  const stableString = 'STABLE';
  const expectedStableBytes = Uint8Array.from([83, 84, 65, 66, 76, 69]);

  expect(stringToBytes(stableString)).toEqual(expectedStableBytes);
});

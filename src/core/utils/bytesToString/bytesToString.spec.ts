import { bytesToString } from './bytesToString.ts';

test('it should convert ada bytes to ada name', () => {
  const adaBytes = Uint8Array.from([]);
  const expectedAdaString = '';

  expect(bytesToString(adaBytes)).toEqual(expectedAdaString);
});

test('it should convert spf bytes to spf name', () => {
  const spfBytes = Uint8Array.from([83, 80, 70]);
  const expectedSpfString = 'SPF';

  expect(bytesToString(spfBytes)).toEqual(expectedSpfString);
});

test('it should convert STABLE bytes to STABLE name', () => {
  const stableBytes = Uint8Array.from([83, 84, 65, 66, 76, 69]);
  const expectedStableString = 'STABLE';

  expect(bytesToString(stableBytes)).toEqual(expectedStableString);
});

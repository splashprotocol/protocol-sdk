import { bytesToHex } from './bytesToHex.ts';

test('it should convert ada bytes to ada hex', () => {
  const adaBytes = Uint8Array.from([]);
  const expectedAdaHex = '';

  expect(bytesToHex(adaBytes)).toEqual(expectedAdaHex);
});

test('it should convert spf bytes to spf hex', () => {
  const spfBytes = Uint8Array.from([83, 80, 70]);
  const expectedSpfHex = '535046';

  expect(bytesToHex(spfBytes)).toEqual(expectedSpfHex);
});

test('it should convert STABLE bytes to STABLE hex', () => {
  const stableBytes = Uint8Array.from([83, 84, 65, 66, 76, 69]);
  const expectedStableHex = '535441424c45';

  expect(bytesToHex(stableBytes)).toEqual(expectedStableHex);
});

import { hexToBytes } from './hexToBytes.ts';

test('it should convert ada hex to ada bytes', () => {
  const adaHex = '';
  const expectedAdaBytes = Uint8Array.from([]);

  expect(hexToBytes(adaHex)).toEqual(expectedAdaBytes);
});

test('it should convert spf hex to spf bytes', () => {
  const spfHex = '535046';
  const expectedSpfBytes = Uint8Array.from([83, 80, 70]);

  expect(hexToBytes(spfHex)).toEqual(expectedSpfBytes);
});

test('it should convert STABLE hex to STABLE bytes', () => {
  const stableHex = '535441424c45';
  const expectedStableBytes = Uint8Array.from([83, 84, 65, 66, 76, 69]);

  expect(hexToBytes(stableHex)).toEqual(expectedStableBytes);
});

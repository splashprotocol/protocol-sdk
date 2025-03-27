import { isValidBech32 } from './isValidBech32.ts';

test('is should returns true', () => {
  expect(
    isValidBech32(
      'addr1q9cehmjzf2tmtzeae2y0uhdxl6kxf992wgn0ja0n2pk9kftcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxsqwq3mt',
    ),
  ).toBe(true);
});

test('is should returns false', () => {
  expect(isValidBech32('fasdsad')).toBe(false);
});

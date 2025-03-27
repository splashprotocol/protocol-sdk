import { BaseAddress } from './BaseAddress.ts';
import { CredentialType } from '../common/types/CredentialType.ts';

const addr1Bech32 =
  'addr1q9cehmjzf2tmtzeae2y0uhdxl6kxf992wgn0ja0n2pk9kftcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxsqwq3mt';
const addr1Hex =
  '01719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b257846f6bb07f5b2825885e4502679e699b4e60a0c4609a46bc35454cd';

const addr2Bech32 =
  'addr1x8mql508pa9emlqfeh0g6lmlzfmauf55eq49zmta8ny7q04j764lvrxdayh2ux30fl0ktuh27csgmpevdu89jlxppvrs08z9dt';
const addr2Hex =
  '31f60fd1e70f4b9dfc09cdde8d7f7f1277de2694c82a516d7d3cc9e03eb2f6abf60ccde92eae1a2f4fdf65f2eaf6208d872c6f0e597cc10b07';

test('it should create valid base address from bech32', () => {
  const baseAddr1 = BaseAddress.fromBech32(addr1Bech32);

  expect(baseAddr1).toBeInstanceOf(BaseAddress);
  expect(baseAddr1.toBech32()).toBe(addr1Bech32);
  expect(baseAddr1.toHex()).toBe(addr1Hex);
  expect(baseAddr1.payment.hash).toBe(
    '719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b25',
  );
  expect(baseAddr1.payment.type).toBe(CredentialType.KeyHash);
  expect(baseAddr1.stake.hash).toBe(
    '7846f6bb07f5b2825885e4502679e699b4e60a0c4609a46bc35454cd',
  );
  expect(baseAddr1.stake.type).toBe(CredentialType.KeyHash);

  const baseAddr2 = BaseAddress.fromBech32(addr2Bech32);
  expect(baseAddr2).toBeInstanceOf(BaseAddress);
  expect(baseAddr2.toBech32()).toBe(addr2Bech32);
  expect(baseAddr2.toHex()).toBe(addr2Hex);
  expect(baseAddr2.payment.hash).toBe(
    'f60fd1e70f4b9dfc09cdde8d7f7f1277de2694c82a516d7d3cc9e03e',
  );
  expect(baseAddr2.payment.type).toBe(CredentialType.ScriptHash);
  expect(baseAddr2.stake.hash).toBe(
    'b2f6abf60ccde92eae1a2f4fdf65f2eaf6208d872c6f0e597cc10b07',
  );
  expect(baseAddr2.stake.type).toBe(CredentialType.ScriptHash);
});

test('it should create valid base address from hex', () => {
  const baseAddr1 = BaseAddress.fromHex(addr1Hex);

  expect(baseAddr1).toBeInstanceOf(BaseAddress);
  expect(baseAddr1.toBech32()).toBe(addr1Bech32);
  expect(baseAddr1.toHex()).toBe(addr1Hex);
  expect(baseAddr1.payment.hash).toBe(
    '719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b25',
  );
  expect(baseAddr1.payment.type).toBe(CredentialType.KeyHash);
  expect(baseAddr1.stake.hash).toBe(
    '7846f6bb07f5b2825885e4502679e699b4e60a0c4609a46bc35454cd',
  );
  expect(baseAddr1.stake.type).toBe(CredentialType.KeyHash);

  const baseAddr2 = BaseAddress.fromHex(addr2Hex);
  expect(baseAddr2).toBeInstanceOf(BaseAddress);
  expect(baseAddr2.toBech32()).toBe(addr2Bech32);
  expect(baseAddr2.toHex()).toBe(addr2Hex);
  expect(baseAddr2.payment.hash).toBe(
    'f60fd1e70f4b9dfc09cdde8d7f7f1277de2694c82a516d7d3cc9e03e',
  );
  expect(baseAddr2.payment.type).toBe(CredentialType.ScriptHash);
  expect(baseAddr2.stake.hash).toBe(
    'b2f6abf60ccde92eae1a2f4fdf65f2eaf6208d872c6f0e597cc10b07',
  );
  expect(baseAddr2.stake.type).toBe(CredentialType.ScriptHash);
});

test('it should throws error', () => {
  try {
    BaseAddress.fromHex('l;dasds');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should throws error #2', () => {
  try {
    BaseAddress.fromBech32('l;dasds');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

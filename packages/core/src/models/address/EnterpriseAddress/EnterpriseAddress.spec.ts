import { CredentialType } from '../common/types/CredentialType.ts';
import { EnterpriseAddress } from './EnterpriseAddress.ts';

const addr1Bech32 =
  'addr1v9cehmjzf2tmtzeae2y0uhdxl6kxf992wgn0ja0n2pk9kfgal8hcx';
const addr1Hex = '61719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b25';

const addr2Bech32 =
  'addr1w8mql508pa9emlqfeh0g6lmlzfmauf55eq49zmta8ny7q0selcazr';
const addr2Hex = '71f60fd1e70f4b9dfc09cdde8d7f7f1277de2694c82a516d7d3cc9e03e';

test('it should create valid enterprise address from bech32', () => {
  const baseAddr1 = EnterpriseAddress.fromBech32(addr1Bech32);

  expect(baseAddr1).toBeInstanceOf(EnterpriseAddress);
  expect(baseAddr1.toBech32()).toBe(addr1Bech32);
  expect(baseAddr1.toHex()).toBe(addr1Hex);
  expect(baseAddr1.payment.hash).toBe(
    '719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b25',
  );
  expect(baseAddr1.payment.type).toBe(CredentialType.KeyHash);

  const baseAddr2 = EnterpriseAddress.fromBech32(addr2Bech32);

  expect(baseAddr2).toBeInstanceOf(EnterpriseAddress);
  expect(baseAddr2.toBech32()).toBe(addr2Bech32);
  expect(baseAddr2.toHex()).toBe(addr2Hex);
  expect(baseAddr2.payment.hash).toBe(
    'f60fd1e70f4b9dfc09cdde8d7f7f1277de2694c82a516d7d3cc9e03e',
  );
  expect(baseAddr2.payment.type).toBe(CredentialType.ScriptHash);
});

test('it should create valid enterprise address from hex', () => {
  const baseAddr1 = EnterpriseAddress.fromHex(addr1Hex);

  expect(baseAddr1).toBeInstanceOf(EnterpriseAddress);
  expect(baseAddr1.toBech32()).toBe(addr1Bech32);
  expect(baseAddr1.toHex()).toBe(addr1Hex);
  expect(baseAddr1.payment.hash).toBe(
    '719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b25',
  );
  expect(baseAddr1.payment.type).toBe(CredentialType.KeyHash);

  const baseAddr2 = EnterpriseAddress.fromHex(addr2Hex);
  expect(baseAddr2).toBeInstanceOf(EnterpriseAddress);
  expect(baseAddr2.toBech32()).toBe(addr2Bech32);
  expect(baseAddr2.toHex()).toBe(addr2Hex);
  expect(baseAddr2.payment.hash).toBe(
    'f60fd1e70f4b9dfc09cdde8d7f7f1277de2694c82a516d7d3cc9e03e',
  );
  expect(baseAddr2.payment.type).toBe(CredentialType.ScriptHash);
});

test('it should throws error', () => {
  try {
    EnterpriseAddress.fromHex('l;dasds');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should throws error #2', () => {
  try {
    EnterpriseAddress.fromBech32('l;dasds');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

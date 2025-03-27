import { ValueCbor } from './ValueCbor.ts';
import { bytesToHex } from '../../encoding/bytesToHex/bytesToHex.ts';
import { AssetInfo } from '../../../models/assetInfo/AssetInfo.ts';
import { EMISSION_LP } from '../../../models/pool/common/emissionLp.ts';
import { hexToBytes } from '../../encoding/hexToBytes/hexToBytes.ts';

test('it should returns object from cbor hex', () => {
  const object = ValueCbor.decodeCborHexToObject(
    '821864a1581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75a1435350461b7fffffffffffffff',
  );

  expect(BigInt(object[0])).toBe(100n);
  expect(object[1]).toBeInstanceOf(Map);
  for (let [policyId, assets] of object[1]) {
    expect(bytesToHex(policyId)).toBe(AssetInfo.spf.policyId);
    for (let [name, amount] of assets) {
      expect(bytesToHex(name)).toBe(AssetInfo.spf.nameBase16);
      expect(amount).toBe(EMISSION_LP);
    }
  }
});

test('it should returns object from cbor bytes', () => {
  const object = ValueCbor.decodeCborBytesToObject(
    hexToBytes(
      '821864a1581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75a1435350461b7fffffffffffffff',
    ),
  );

  expect(BigInt(object[0])).toBe(100n);
  expect(object[1]).toBeInstanceOf(Map);
  for (let [policyId, assets] of object[1]) {
    expect(bytesToHex(policyId)).toBe(AssetInfo.spf.policyId);
    for (let [name, amount] of assets) {
      expect(bytesToHex(name)).toBe(AssetInfo.spf.nameBase16);
      expect(amount).toBe(EMISSION_LP);
    }
  }
});

test('it should returns with only ada from cbor hex', () => {
  const object = ValueCbor.decodeCborHexToObject(
    '821864a1581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75a1435350461b7fffffffffffffff',
  );

  expect(BigInt(object[0])).toBe(100n);
  expect(object[1]).toBeInstanceOf(Map);
  for (let [policyId, assets] of object[1]) {
    expect(bytesToHex(policyId)).toBe(AssetInfo.spf.policyId);
    for (let [name, amount] of assets) {
      expect(bytesToHex(name)).toBe(AssetInfo.spf.nameBase16);
      expect(amount).toBe(EMISSION_LP);
    }
  }
});

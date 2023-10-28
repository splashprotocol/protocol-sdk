import { PlutusData } from '@emurgo/cardano-serialization-lib-browser';

import { bytesToHex } from '../../../../utils/bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../../../../utils/hexToBytes/hexToBytes.ts';
import { SpectrumDatumByteHexString } from './SpectrumDatumByteHexString.ts';

test('it should serialize hex string type to PlutusData representation', () => {
  const hexStr = '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const hexStrDatum = SpectrumDatumByteHexString.serialize(hexStr);

  expect(hexStrDatum).toBeInstanceOf(PlutusData);
  expect(bytesToHex(hexStrDatum.as_bytes()!)).toBe(hexStr);
});

test('it should deserialize PlutusData representation to hex string', () => {
  const expectedHexStr =
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
  const hexStrDatum = PlutusData.new_bytes(hexToBytes(expectedHexStr));
  const strResult = SpectrumDatumByteHexString.deserialize(hexStrDatum);

  expect(typeof strResult).toBe('string');
  expect(strResult).toBe(expectedHexStr);
});

import { HexString } from '../../../types/HexString.ts';

import * as Cbor from 'cbor-web';
import { hexToBytes } from '../../encoding/hexToBytes/hexToBytes.ts';
import { CborHexString } from '../../../types/CborHexString.ts';
import { bytesToHex } from '../../encoding/bytesToHex/bytesToHex.ts';
import { stringToHex } from '../../encoding/stringToHex/stringToHex.ts';
import { hexToString } from '../../encoding/hexToString/hexToString.ts';

export const AssetNameCbor = {
  encodeHexToCborBytes: (base16Name: HexString): Uint8Array =>
    Cbor.encode(hexToBytes(base16Name)).slice(2),

  encodeHexToCborHex: (base16Name: HexString): CborHexString =>
    bytesToHex(AssetNameCbor.encodeHexToCborBytes(base16Name)),

  encodeStringToCborBytes: (name: string): Uint8Array =>
    AssetNameCbor.encodeHexToCborBytes(stringToHex(name)),

  encodeStringToCborHex: (name: string): CborHexString =>
    AssetNameCbor.encodeHexToCborHex(stringToHex(name)),

  decodeCborBytesToHex: (arrayLike: Buffer | Uint8Array): HexString =>
    bytesToHex(Cbor.decode(arrayLike)),

  decodeCborHexToHex: (cbor: CborHexString): HexString =>
    AssetNameCbor.decodeCborBytesToHex(hexToBytes(cbor)),

  decodeCborBytesToString: (arrayLike: Buffer | Uint8Array): string =>
    hexToString(AssetNameCbor.decodeCborBytesToHex(arrayLike)),

  decodeCborHexToString: (cbor: CborHexString): string =>
    hexToString(AssetNameCbor.decodeCborHexToHex(cbor)),
};

import { PlutusData } from '@emurgo/cardano-serialization-lib-browser';

import { bytesToHex } from '../../../../utils/bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../../../../utils/hexToBytes/hexToBytes.ts';
import { DatumType } from '../../common/DatumType.ts';

/**
 * Representation of hex string like byte string in datum
 * @example {"bytes": <encodedString>}
 * @type {{serialize(value: string): PlutusData, deserialize(pd: PlutusData): string}}
 */
export const SpectrumDatumByteHexString: DatumType<string> = {
  serialize(value: string): PlutusData {
    return PlutusData.new_bytes(hexToBytes(value));
  },
  deserialize(pd: PlutusData): string {
    return bytesToHex(pd.as_bytes()!);
  },
};

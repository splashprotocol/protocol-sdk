import { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';

import { bytesToHex } from '../../../../utils/bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../../../../utils/hexToBytes/hexToBytes.ts';
import { DataType, toDataType } from '../../common/DataType.ts';

/**
 * Representation of hex string like byte string in datum
 * @example {"bytes": <encodedString>}
 * @type {{serialize(value: string): PlutusData, deserialize(pd: PlutusData): string}}
 */
export const BytesDataType: DataType<string> = toDataType({
  serialize(value: string): PlutusData {
    return PlutusData.new_bytes(hexToBytes(value));
  },
  deserialize(pd: PlutusData): string {
    return bytesToHex(pd.as_bytes()!);
  },
});

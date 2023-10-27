import { PlutusData } from '@emurgo/cardano-serialization-lib-browser';

import { bytesToHex } from '../../../utils/bytesToHex/bytesToHex.ts';
import { hexToBytes } from '../../../utils/hexToBytes/hexToBytes.ts';
import { DatumType } from '../common/DatumType';

export const DatumByteString: DatumType<string> = {
  serialize(value: string): PlutusData {
    return PlutusData.new_bytes(hexToBytes(value));
  },
  deserialize(pd: PlutusData): string {
    return bytesToHex(pd.as_bytes()!);
  },
};

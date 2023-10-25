import {
  AssetName,
  ScriptHash,
} from '@emurgo/cardano-serialization-lib-browser';

import { CborHexString, HexString } from '../../types/types';
import { bytesToString } from '../../utils/bytesToString';
import { hexToCborHex } from '../../utils/hexToCborHex';
import { stringToCborHex } from '../../utils/stringToCborHex';

export class AssetInfo {
  static fromNameString(policyId: HexString, name: string): AssetInfo {
    return new AssetInfo(policyId, AssetName.from_hex(stringToCborHex(name)));
  }

  static fromNameHex(policyId: HexString, name: HexString): AssetInfo {
    return new AssetInfo(policyId, AssetName.from_hex(hexToCborHex(name)));
  }

  static fromNameCborHex(policyId: HexString, name: CborHexString): AssetInfo {
    return new AssetInfo(policyId, AssetName.from_hex(name));
  }

  private constructor(
    public policyId: HexString,
    private assetName: AssetName,
  ) {}

  toWasmName() {
    return this.assetName;
  }

  toWasmPolicyId() {
    if (!this.policyId) {
      throw new Error('ada has no wasm script hash');
    }
    return ScriptHash.from_hex(this.policyId);
  }

  get name(): string {
    return bytesToString(this.assetName.name());
  }

  get nameHex(): HexString {
    return this.assetName.to_js_value();
  }

  get nameCborHex(): HexString {
    return this.assetName.to_hex();
  }

  get subject(): string {
    return `${this.policyId}${this.nameHex}`;
  }

  get spectrumId(): string {
    return `${this.policyId}.${this.name}`;
  }
}

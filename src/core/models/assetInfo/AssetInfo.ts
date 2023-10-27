import {
  AssetName,
  ScriptHash,
} from '@emurgo/cardano-serialization-lib-browser';

import { CborHexString, HexString } from '../../types/types';
import { bytesToString } from '../../utils/bytesToString/bytesToString.ts';
import { hexToCborHex } from '../../utils/hexToCborHex/hexToCborHex.ts';
import { stringToCborHex } from '../../utils/stringToCborHex/stringToCborHex.ts';

/**
 * Asset info representation object
 */
export class AssetInfo {
  /**
   * Creates an instance of AssetInfo from name string and policy id
   * @param {HexString} policyId
   * @param {string} name
   * @returns {AssetInfo}
   */
  static fromNameString(policyId: HexString, name: string): AssetInfo {
    return new AssetInfo(policyId, AssetName.from_hex(stringToCborHex(name)));
  }

  /**
   * Creates an instance of AssetInfo from name hex string and policy id
   * @param {HexString} policyId
   * @param {HexString} name
   * @returns {AssetInfo}
   */
  static fromNameHex(policyId: HexString, name: HexString): AssetInfo {
    return new AssetInfo(policyId, AssetName.from_hex(hexToCborHex(name)));
  }

  /**
   * Creates an instance of AssetInfo from name cbor hex string and policy id
   * @param {HexString} policyId
   * @param {CborHexString} name
   * @returns {AssetInfo}
   */
  static fromNameCborHex(policyId: HexString, name: CborHexString): AssetInfo {
    return new AssetInfo(policyId, AssetName.from_hex(name));
  }

  private constructor(
    public policyId: HexString,
    private assetName: AssetName,
  ) {}

  /**
   * Returns cardano serlib assetName representation
   * @returns {AssetName}
   */
  get wasmName() {
    return this.assetName;
  }

  /**
   * Returns cardano serlib scriptHash representation
   * @returns {ScriptHash}
   */
  get wasmPolicyId() {
    if (!this.policyId) {
      throw new Error('ada has no wasm script hash');
    }
    return ScriptHash.from_hex(this.policyId);
  }

  /**
   * Returns name string
   * @returns {string}
   */
  get name(): string {
    return bytesToString(this.assetName.name());
  }

  /**
   * Returns name hex representation
   * @returns {HexString}
   */
  get nameHex(): HexString {
    return this.assetName.to_js_value();
  }

  /**
   * Returns name cbor hex representation
   * @returns {HexString}
   */
  get nameCborHex(): HexString {
    return this.assetName.to_hex();
  }

  /**
   * Returns asset subject. Will be useful for getting meta info from cardano meta repo
   * @returns {string}
   */
  get subject(): string {
    return `${this.policyId}${this.nameHex}`;
  }

  /**
   * Returns spectrum id. Will be useful for spectrum services integration
   * @returns {string}
   */
  get spectrumId(): string {
    return `${this.policyId}.${this.name}`;
  }
}

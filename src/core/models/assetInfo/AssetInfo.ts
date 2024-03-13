import {
  AssetName,
  ScriptHash,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { AssetId, CborHexString, HexString } from '../../types/types';
import { cborHexToString } from '../../utils/cborHexToString/cborHexToString.ts';
import { hexToCborHex } from '../../utils/hexToCborHex/hexToCborHex.ts';
import { stringToCborHex } from '../../utils/stringToCborHex/stringToCborHex.ts';

export interface AssetInfoBaseParams {
  readonly policyId: string;
}

export interface AssetInfoCborParams extends AssetInfoBaseParams {
  readonly name: CborHexString;
  readonly type: 'cbor';
}

export interface AssetInfoBase16Params extends AssetInfoBaseParams {
  readonly name: HexString;
  readonly type: 'base16';
}

export interface AssetInfoStringParams extends AssetInfoBaseParams {
  readonly name: string;
  readonly type: 'raw';
}

export type AssetInfoParams =
  | AssetInfoCborParams
  | AssetInfoStringParams
  | AssetInfoBase16Params;

export interface AssetInfoMetadata {
  readonly policyId: string;
  readonly name: string;
  readonly ticker?: string;
  readonly description?: string;
  readonly url?: string;
  readonly decimals?: number;
  readonly logo?: string;
}

/**
 * Asset info representation object
 */
export class AssetInfo {
  /**
   * Creates an instance of AssetInfo from specified params
   * @param {AssetInfoParams} params
   * @returns {AssetInfo}
   */
  static new(
    { name, type, policyId }: AssetInfoParams,
    metadata?: AssetInfoMetadata,
  ): AssetInfo {
    switch (type) {
      case 'raw':
        return new AssetInfo(
          policyId,
          AssetName.from_cbor_hex(stringToCborHex(name)),
          metadata,
        );
      case 'base16':
        return new AssetInfo(
          policyId,
          AssetName.from_cbor_hex(hexToCborHex(name)),
          metadata,
        );
      case 'cbor':
        return new AssetInfo(policyId, AssetName.from_cbor_hex(name), metadata);
    }
  }

  private constructor(
    public policyId: HexString,
    private assetName: AssetName,
    private metadata?: AssetInfoMetadata,
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
    return cborHexToString(this.assetName.to_cbor_hex());
  }

  /**
   * Returns name hex representation
   * @returns {HexString}
   */
  get nameBase16(): HexString {
    return this.assetName.to_js_value();
  }

  /**
   * Returns name cbor hex representation
   * @returns {HexString}
   */
  get nameCbor(): HexString {
    return this.assetName.to_cbor_hex();
  }

  /**
   * Returns asset subject. Will be useful for getting meta info from cardano meta repo
   * @returns {string}
   */
  get subject(): string {
    return `${this.policyId}${this.nameBase16}`;
  }

  /**
   * Returns spectrum id. Will be useful for splash services integration. Pattern: ${policyId}.${base16AssetName}
   * @returns {AssetId}
   */
  get splashId(): AssetId {
    return `${this.policyId}.${this.nameBase16}`;
  }

  /**
   * Returns asset decimals count. 0 if metadata not specified
   * @returns {number}
   */
  get decimals(): number {
    return this.metadata?.decimals || 0;
  }

  /**
   * Returns asset ticker. assetName if metadata not specified
   * @returns {string}
   */
  get ticker(): string {
    return this.metadata?.ticker || this.name;
  }

  /**
   * Returns asset description
   * @returns {string | undefined}
   */
  get description(): string | undefined {
    return this.metadata?.description;
  }

  /**
   * Returns asset logo url
   * @returns {string | undefined}
   */
  get logo(): string | undefined {
    return this.metadata?.logo;
  }

  /**
   * Returns asset project url
   * @returns {string | undefined}
   */
  get url(): string | undefined {
    return this.metadata?.url;
  }

  /**
   * Creates new asset info with metadata
   * @param {AssetInfoMetadata} metadata
   * @returns {AssetInfo}
   */
  withMetadata(metadata?: AssetInfoMetadata): AssetInfo {
    return AssetInfo.new(
      {
        name: this.nameCbor,
        type: 'cbor',
        policyId: this.policyId,
      },
      metadata,
    );
  }
}

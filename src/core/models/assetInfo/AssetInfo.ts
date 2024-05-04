import {
  AssetName,
  ScriptHash,
} from '@dcspark/cardano-multiplatform-lib-browser';

import {
  AssetId,
  AssetSubject,
  CborHexString,
  HexString,
} from '../../types/types';
import { cborHexToHex } from '../../utils/cborHexToHex/cborHexToHex.ts';
import { cborHexToString } from '../../utils/cborHexToString/cborHexToString.ts';
import { hexToCborHex } from '../../utils/hexToCborHex/hexToCborHex.ts';
import { hexToString } from '../../utils/hexToString/hexToString.ts';
import { stringToCborHex } from '../../utils/stringToCborHex/stringToCborHex.ts';
import { stringToHex } from '../../utils/stringToHex/stringToHex.ts';

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

interface AssetInfoPrivateParams {
  readonly policyId: string;
  readonly name: string;
  readonly nameBase16: HexString;
  readonly nameCbor: CborHexString;
}

export interface AssetInfoMetadata {
  readonly policyId: string;
  readonly name: string;
  readonly subject: AssetSubject;
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
   * Usd asset info
   * @type {AssetInfo}
   */
  static usd: AssetInfo = AssetInfo.new(
    {
      policyId: '',
      name: 'usd',
      type: 'raw',
    },
    {
      name: 'usd',
      policyId: '',
      subject: 'usd',
      decimals: 2,
      ticker: '$',
    },
  );

  /**
   * Splash asset info
   * @type {AssetInfo}
   */
  static splash: AssetInfo = AssetInfo.new({
    policyId: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
    name: 'SPLASH',
    type: 'raw',
  });

  /**
   * Spf asset info
   * @type {AssetInfo}
   */
  static spf: AssetInfo = AssetInfo.new(
    {
      policyId: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
      name: '43535046',
      type: 'cbor',
    },
    {
      name: 'SPF',
      ticker: 'SPF',
      decimals: 6,
      subject: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75535046',
      policyId: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
      url: 'https://spectrum.fi/logos/cardano/09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75535046.webp',
    },
  );

  /**
   * Ada asset info
   * @type {AssetInfo}
   */
  static ada: AssetInfo = AssetInfo.new(
    {
      name: '',
      policyId: '',
      type: 'base16',
    },
    {
      name: '',
      policyId: '',
      subject: '',
      // TODO: THINK about union metadata store
      logo: 'https://spectrum.fi/logos/cardano/token-ada.svg',
      decimals: 6,
      ticker: 'ADA',
    },
  );

  /**
   * Creates an instance of AssetInfo from specified params
   * @param {AssetInfoParams} params
   * @param {AssetInfoMetadata | undefined} metadata
   * @returns {AssetInfo}
   */
  static new(
    { name, type, policyId }: AssetInfoParams,
    metadata?: AssetInfoMetadata,
  ): AssetInfo {
    switch (type) {
      case 'raw':
        return new AssetInfo(
          {
            policyId,
            name,
            nameCbor: stringToCborHex(name),
            nameBase16: stringToHex(name),
          },

          metadata,
        );
      case 'base16':
        return new AssetInfo(
          {
            policyId,
            name: hexToString(name),
            nameCbor: hexToCborHex(name),
            nameBase16: name,
          },
          metadata,
        );
      case 'cbor':
        return new AssetInfo(
          {
            policyId,
            name: cborHexToString(name),
            nameBase16: cborHexToHex(name),
            nameCbor: name,
          },
          metadata,
        );
    }
  }

  /**
   * Asset policyId
   * @type {HexString}
   */
  public policyId: HexString;

  /**
   * Asset name
   * @type {string}
   */
  public name: string;

  /**
   * Asset name in base16
   * @type {HexString}
   * @private
   */
  public nameBase16: HexString;

  /**
   * Asset name in cbor
   * @type {CborHexString}
   * @private
   */
  public nameCbor: CborHexString;

  private constructor(
    { policyId, nameBase16, nameCbor, name }: AssetInfoPrivateParams,
    private metadata?: AssetInfoMetadata,
  ) {
    this.policyId = policyId;
    this.name = name;
    this.nameBase16 = nameBase16;
    this.nameCbor = nameCbor;
  }

  /**
   * Returns cardano serlib assetName representation
   * @returns {AssetName}
   */
  get wasmName() {
    return AssetName.from_cbor_hex(this.nameCbor);
  }

  /**
   * Returns cardano serlib scriptHash representation
   * @returns {ScriptHash}
   */
  get wasmPolicyId(): ScriptHash {
    if (!this.policyId) {
      throw new Error('ada has no wasm script hash');
    }
    return ScriptHash.from_hex(this.policyId);
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
   * Returns true if asset info is ada
   */
  isAda(): boolean {
    return this.splashId === AssetInfo.ada.splashId;
  }

  /**
   * Returns true if assets are equals
   * @param {AssetInfo | AssetId} assetOrSplashId
   * @return {boolean}
   */
  isEquals(assetOrSplashId: AssetInfo | AssetId): boolean {
    const splashId =
      assetOrSplashId instanceof AssetInfo
        ? assetOrSplashId.splashId
        : assetOrSplashId;

    return splashId === this.splashId;
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

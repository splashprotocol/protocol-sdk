import { hexToString } from '../../utils/encoding/hexToString/hexToString.ts';
import { stringToHex } from '../../utils/encoding/stringToHex/stringToHex.ts';
import { CborHexString } from '../../types/CborHexString.ts';
import { HexString } from '../../types/HexString.ts';
import { AssetSubject } from '../../types/AssetSubject.ts';
import { Cbor } from '../../utils/cbor/Cbor.ts';
import { AssetNameCbor } from '../../utils/cbor/AssetNameCbor/AssetNameCbor.ts';
import { AssetId } from '../../types/AssetId.ts';

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
  readonly launchedBy?: string;
  readonly ticker?: string;
  readonly description?: string;
  readonly socials?: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  readonly url?: string;
  readonly decimals?: number;
  readonly logo?: string;
  readonly verified?: boolean;
}

/**
 * Asset info representation object
 */
export class AssetInfo {
  /**
   * Usd asset info
   * @type {AssetInfo}
   */
  static usd: AssetInfo = AssetInfo.fromString('', 'usd', {
    name: 'usd',
    policyId: '',
    subject: 'usd',
    decimals: 2,
    ticker: '$',
    verified: true,
  });

  /**
   * Splash asset info
   * @type {AssetInfo}
   */
  static splash: AssetInfo = AssetInfo.fromBase16(
    'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3',
    '53504c415348',
    {
      policyId: 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3',
      subject:
        'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e353504c415348',
      decimals: 6,
      ticker: 'SPLASH',
      description:
        'Governance Token for Splash Protocol - the fully decentralized and open source exchange for efficient on-chain market making.',
      name: 'SPLASH',
      url: 'https://splash.trade',
      logo: 'https://spectrum.fi/logos/cardano/ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e353504c415348.webp',
      verified: true,
    },
  );

  /**
   * Spf asset info
   * @type {AssetInfo}
   */
  static spf: AssetInfo = AssetInfo.fromCbor(
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
    '43535046',
    {
      name: 'SPF',
      ticker: 'SPF',
      decimals: 6,
      subject: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75535046',
      policyId: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
      logo: 'https://spectrum.fi/logos/cardano/09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75535046.webp',
      verified: true,
    },
  );

  /**
   * Ada asset info
   * @type {AssetInfo}
   */
  static ada: AssetInfo = AssetInfo.fromBase16(
    '',
    '',

    {
      name: '',
      policyId: '',
      subject: '',
      logo: 'https://spectrum.fi/logos/cardano/token-ada.svg',
      decimals: 6,
      ticker: 'ADA',
      verified: true,
    },
  );

  /**
   * Creates an instance of AssetInfo from policyId and rawName
   * @param {HexString} policyId
   * @param {string} name
   * @param {AssetInfoMetadata | undefined} metadata
   * @returns {AssetInfo}
   */
  static fromString(
    policyId: HexString,
    name: string,
    metadata?: AssetInfoMetadata,
  ): AssetInfo {
    return new AssetInfo(
      {
        policyId,
        name,
        nameBase16: stringToHex(name),
        nameCbor: Cbor.AssetNameCbor.encodeStringToCborHex(name),
      },
      metadata,
    );
  }

  /**
   * Creates an instance of AssetInfo from policyId and base16Name
   * @param {HexString} policyId
   * @param {HexString} nameBase16
   * @param {AssetInfoMetadata | undefined} metadata
   * @returns {AssetInfo}
   */
  static fromBase16(
    policyId: HexString,
    nameBase16: HexString,
    metadata?: AssetInfoMetadata,
  ): AssetInfo {
    return new AssetInfo(
      {
        policyId,
        nameBase16,
        name: hexToString(nameBase16),
        nameCbor: Cbor.AssetNameCbor.encodeHexToCborHex(nameBase16),
      },
      metadata,
    );
  }

  /**
   * Creates an instance of AssetInfo from policyId and cbor
   * @param {HexString} policyId
   * @param {CborHexString} cbor
   * @param {AssetInfoMetadata | undefined} metadata
   * @returns {AssetInfo}
   */
  static fromCbor(
    policyId: HexString,
    cbor: CborHexString,
    metadata?: AssetInfoMetadata,
  ): AssetInfo {
    return new AssetInfo(
      {
        policyId,
        nameBase16: AssetNameCbor.decodeCborHexToHex(cbor),
        name: AssetNameCbor.decodeCborHexToString(cbor),
        nameCbor: cbor,
      },
      metadata,
    );
  }

  /**
   * Creates an instance of AssetInfo from asset id
   * @param {AssetId} assetId
   * @param {AssetInfoMetadata | undefined} metadata
   * @returns {AssetInfo}
   */
  static fromAssetId(
    assetId: AssetId,
    metadata?: AssetInfoMetadata,
  ): AssetInfo {
    const [policyId, nameBase16] = assetId.split('.');

    return this.fromBase16(policyId, nameBase16, metadata);
  }

  /**
   * Creates an instance of AssetInfo from subject
   * @param {AssetSubject} subject
   * @param {AssetInfoMetadata | undefined} metadata
   * @returns {AssetInfo}
   */
  static fromSubject(
    subject: AssetSubject,
    metadata?: AssetInfoMetadata,
  ): AssetInfo {
    const [policyId, nameBase16] = [
      subject.slice(0, 56),
      subject.slice(56, subject.length),
    ];

    return this.fromBase16(policyId, nameBase16, metadata);
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

  /**
   * Asset metadata
   */
  public metadata?: AssetInfoMetadata;

  private constructor(
    { policyId, nameBase16, nameCbor, name }: AssetInfoPrivateParams,
    metadata?: AssetInfoMetadata,
  ) {
    this.policyId = policyId;
    this.name = name;
    this.nameBase16 = nameBase16;
    this.nameCbor = nameCbor;
    this.metadata = metadata;
  }

  /**
   * Returns asset subject. Will be useful for getting meta info from cardano meta repo
   * @returns {string}
   */
  get subject(): string {
    return `${this.policyId}${this.nameBase16}`;
  }

  /**
   * Returns asset id. Will be useful for splash services integration. Pattern: ${policyId}.${base16AssetName}
   * @returns {AssetId}
   */
  get assetId(): AssetId {
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
   * Returns asset ticker
   * @returns {string}
   */
  get ticker(): string | undefined {
    return this.metadata?.ticker;
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
   * Returns socials
   * @returns {AssetInfoMetadata['socials'] | undefined}
   */
  get socials(): AssetInfoMetadata['socials'] | undefined {
    return this.metadata?.socials;
  }

  /**
   * Returns token launch platform
   * @returns {AssetInfoMetadata['socials'] | undefined}
   */
  get launchedBy(): string | undefined {
    return this.metadata?.launchedBy;
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
    return this.assetId === AssetInfo.ada.assetId;
  }

  /**
   * Returns true if assets are equals
   * @param {AssetInfo | AssetId} assetOrAssetId
   * @return {boolean}
   */
  isEquals(assetOrAssetId: AssetInfo | AssetId): boolean {
    const assetIdToCompare =
      assetOrAssetId instanceof AssetInfo
        ? assetOrAssetId.assetId
        : assetOrAssetId;

    return assetIdToCompare === this.assetId;
  }

  /**
   * Creates new asset info with metadata
   * @param {AssetInfoMetadata} metadata
   * @returns {AssetInfo}
   */
  withMetadata(metadata?: AssetInfoMetadata): AssetInfo {
    return new AssetInfo(
      {
        name: this.name,
        nameCbor: this.name,
        nameBase16: this.name,
        policyId: this.policyId,
      },
      metadata,
    );
  }
}

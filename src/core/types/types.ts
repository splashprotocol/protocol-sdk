export type HexString = string;

export type Bech32String = string;

export type CborHexString = string;

export type Dictionary<T> = { [key: string]: T };

/* Asset identifier. Has ${policyId}.${base16Name} structure */
export type AssetId = string;

/* Asset identifier. Has ${policyId}${base16Name} structure */
export type AssetSubject = string;

/* Pool identified. It is Asset identifier for nft asset */
export type PoolId = string;

export type percent = number;

export type price = number;

export type uint = number;

/**
 * Timestamp with milliseconds
 */
export type lts = number;

/**
 * Timestamp with seconds
 */
export type ts = number;

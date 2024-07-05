export type HexString = string;

export type Bech32String = string;

export type CborHexString = string;

export type TransactionHash = string;

export type BlockHash = string;

export type OutputReferenceHash = string;

export interface RationalNumber {
  readonly numerator: bigint;
  readonly denominator: bigint;
}

export interface OutputReference {
  readonly txHash: TransactionHash;
  readonly index: bigint;
}

export type Dictionary<T> = { [key: string]: T };

/* Asset identifier. Has ${policyId}.${base16Name} structure */
export type AssetId = string;

/* Asset identifier. Has ${policyId}${base16Name} structure */
export type AssetSubject = string;

/* Pool identified. It is Asset identifier for nft asset */
export type PoolId = string;

export type percent = number;

export type price = string;

export type uint = number;

/**
 * Timestamp with milliseconds
 */
export type lts = number;

/**
 * Timestamp with seconds
 */
export type ts = number;

/**
 * Tuple with length type
 */
export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

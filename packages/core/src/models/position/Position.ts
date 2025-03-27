import { Pool } from '../pool/common/Pool.ts';
import { Currency } from '../currency/Currency.ts';

export interface PositionParams<P extends Pool<any, any>> {
  readonly pool: P;
  readonly lq: Currency;
}

/**
 * Representation on pool with user asset and locks
 */
export class Position<P extends Pool<any, any>> {
  /**
   * Creates new empty position from ammPool
   * @param {Pool} pool
   * @returns {Position}
   */
  static empty<P extends Pool<any, any>>(pool: P): Position<P> {
    return new Position({
      pool,
      lq: pool.lq.withAmount(0n),
    });
  }

  /**
   * Creates position instance from params
   * @param {PositionParams} params
   * @returns {Position}
   */
  static new<P extends Pool<any, any>>(params: PositionParams<P>): Position<P> {
    return new Position(params);
  }

  /**
   * Current position pool
   * @type {Pool}
   */
  public readonly pool: P;

  /**
   * Current position lq
   * @type {Currency}
   */
  public readonly lq: Currency;

  /**
   * Current position lq in asset representations
   */
  public readonly assets: ReturnType<P['convertLpToAssets']>;

  /**
   * Current positions available for operations lq
   * @type {Currency}
   */
  public readonly availableLq: Currency;

  /**
   * Current position available lq in asset representations
   */
  public readonly availableAssets: ReturnType<P['convertLpToAssets']>;

  /**
   * Current positions locked lq
   */
  public readonly lockedLq: Currency;

  /**
   * Current position locked lq in asset representations
   */
  public readonly lockedAssets: ReturnType<P['convertLpToAssets']>;

  /**
   * Current positions staked lq
   */
  public readonly stakedLq: Currency;

  /**
   * Current position staked lq in asset representations
   */
  public readonly stakedAssets: ReturnType<P['convertLpToAssets']>;

  /**
   * Returns true if user has no lq for this pool
   * @type {boolean}
   */
  public empty: boolean;

  private constructor({ pool, lq }: PositionParams<P>) {
    this.assertLq(pool, lq);
    this.pool = pool;
    this.empty = !lq.isPositive();

    this.lq = lq;
    this.assets = this.pool.convertLpToAssets(this.lq) as ReturnType<
      P['convertLpToAssets']
    >;

    this.availableLq = lq;
    this.availableAssets = this.pool.convertLpToAssets(
      this.availableLq,
    ) as ReturnType<P['convertLpToAssets']>;

    this.lockedLq = this.lq.withAmount(0n);
    this.lockedAssets = this.pool.convertLpToAssets(
      this.lockedLq,
    ) as ReturnType<P['convertLpToAssets']>;

    this.stakedLq = this.lq.withAmount(0n);
    this.stakedAssets = this.pool.convertLpToAssets(
      this.stakedLq,
    ) as ReturnType<P['convertLpToAssets']>;
  }

  private assertLq(pool: P, lq: Currency): void {
    if (pool.lq.asset.assetId !== lq.asset.assetId) {
      throw new Error(
        `lq asset id and pool lq asset id are not equal. Expected: ${pool.lq.asset.assetId}. Received: ${lq.asset.assetId}`,
      );
    }
  }
}

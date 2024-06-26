import { Splash } from '../../../splash/splash.ts';
import { Pool } from '../../types/Pool.ts';
import { Currency } from '../currency/Currency.ts';
import { Transaction } from '../transaction/Transaction.ts';

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
   * @param {Splash<any>} splash
   * @returns {Position}
   */
  static empty<P extends Pool<any, any>>(
    pool: P,
    splash: Splash<any>,
  ): Position<P> {
    return new Position(
      {
        pool,
        lq: pool.lq.withAmount(0n),
      },
      splash,
    );
  }

  /**
   * Creates position instance from params
   * @param {PositionParams} params
   * @param {Splash} splash
   * @returns {Position}
   */
  static new<P extends Pool<any, any>>(
    params: PositionParams<P>,
    splash: Splash<any>,
  ): Position<P> {
    return new Position(params, splash);
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

  private constructor(
    { pool, lq }: PositionParams<P>,
    public splash: Splash<{}>,
  ) {
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

  deposit(...args: Parameters<P['deposit']>): ReturnType<P['deposit']> {
    // @ts-ignore
    return this.pool.deposit(...args);
  }

  /**
   * Redeems specified lq from pool
   * @param {Currency} lq
   * @returns {Promise<any>}
   */
  redeem(lq: Currency): Promise<Transaction> {
    return this.splash
      .newTx()
      .xyRedeem(this.pool as any, lq)
      .complete();
  }

  /**
   * Stakes specified lq to pool
   * @param {Currency} lq
   * @returns {Promise<any>}
   */
  stake(lq: Currency): Promise<any> {
    return Promise.resolve(lq);
  }

  /**
   * Locks specified lq in chain
   * @param {Currency} lq
   * @returns {Promise<any>}
   */
  lock(lq: Currency): Promise<any> {
    return Promise.reject(lq);
  }

  private assertLq(pool: P, lq: Currency): void {
    if (pool.lq.asset.splashId !== lq.asset.splashId) {
      throw new Error(
        `lq asset id and pool lq asset id are not equal. Expected: ${pool.lq.asset.splashId}. Received: ${lq.asset.splashId}`,
      );
    }
  }
}

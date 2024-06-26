import { Currencies } from '../../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../../core/models/pool/cfmm/CfmmPool.ts';
import { StablePool } from '../../../core/models/pool/stable/StablePool.ts';
import { WeightedPool } from '../../../core/models/pool/weighted/WeightedPool.ts';
import { Position } from '../../../core/models/position/Position.ts';

export interface SelectPositionOrEmptyParams {
  readonly pool: CfmmPool | WeightedPool | StablePool;
  readonly balance: Currencies;
}

export type SelectPositionOrEmptyResult =
  | Position<CfmmPool>
  | Position<WeightedPool>
  | Position<StablePool>;

import { Currencies } from '../../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../../core/models/pool/cfmm/CfmmPool.ts';
import { WeightedPool } from '../../../core/models/pool/weighted/WeightedPool.ts';
import { Position } from '../../../core/models/position/Position.ts';

export interface SelectPositionsParams {
  readonly pools: (CfmmPool | WeightedPool)[];
  readonly balance: Currencies;
}

export type SelectPositionsResult = (
  | Position<CfmmPool>
  | Position<WeightedPool>
)[];

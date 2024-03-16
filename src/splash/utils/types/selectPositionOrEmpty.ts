import { Currencies } from '../../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../../core/models/pool/cfmm/CfmmPool.ts';
import { Position } from '../../../core/models/position/Position.ts';

export interface SelectPositionOrEmptyParams {
  readonly pool: CfmmPool;
  readonly balance: Currencies;
}

export type SelectPositionOrEmptyResult = Position<CfmmPool>;

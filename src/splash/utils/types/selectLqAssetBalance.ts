import { Currencies } from '../../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../../core/models/pool/cfmm/CfmmPool.ts';
import { WeightedPool } from '../../../core/models/pool/weighted/WeightedPool.ts';

export interface SelectLqAssetBalanceParams {
  readonly pools: (CfmmPool | WeightedPool)[];
  readonly balance: Currencies;
}

export type SelectLqAssetBalanceResult = Currencies;

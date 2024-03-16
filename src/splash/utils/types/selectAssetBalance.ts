import { Currencies } from '../../../core/models/currencies/Currencies.ts';
import { CfmmPool } from '../../../core/models/pool/cfmm/CfmmPool.ts';

export interface SelectAssetBalanceParams {
  readonly pools: CfmmPool[];
  readonly balance: Currencies;
}

export type SelectAssetBalanceResult = Currencies;

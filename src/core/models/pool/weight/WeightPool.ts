import { Pool } from '../../../types/Pool.ts';
import { Currency } from '../../currency/Currency.ts';

export class WeightPool implements Pool<'weight'> {
  readonly type = 'weight';

  readonly id = Currency.ada(1n);

  readonly lp = Currency.ada(1n);

  constructor() {}
}

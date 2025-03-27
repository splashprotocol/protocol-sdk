import { UTxO } from '../models/UTxO/UTxO.ts';

export interface BuilderExternalCollaterals {
  getCollaterals(): Promise<UTxO[]>;
}

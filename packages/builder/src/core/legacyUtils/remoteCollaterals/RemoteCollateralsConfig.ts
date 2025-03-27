import { RemoteCollateral } from './RemoteCollateral.ts';

import { CborHexString } from '@splashprotocol/core';
import { Transaction } from '../../models/Transaction/Transaction.ts';

export interface RemoteCollateralsConfig {
  getCollaterals(): Promise<RemoteCollateral[]>;

  sign(transaction: Transaction): Promise<CborHexString>;
}

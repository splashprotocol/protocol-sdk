import { TransactionBuilder } from '@dcspark/cardano-multiplatform-lib-browser';

import { NetworkContext } from '../../../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../../../core/types/ProtocolParams.ts';

export interface OperationContext {
  readonly transactionBuilder: TransactionBuilder;
  readonly pParams: ProtocolParams;
  readonly nContext: NetworkContext;
}

export type Operation<P extends any[]> = (
  ...params: P
) => (context: OperationContext) => Promise<any>;

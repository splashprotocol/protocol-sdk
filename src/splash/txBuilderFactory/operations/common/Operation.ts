import { TransactionBuilder } from '@dcspark/cardano-multiplatform-lib-browser';

import { Network } from '../../../../core/types/Network.ts';
import { NetworkContext } from '../../../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../../../core/types/ProtocolParams.ts';
import { Bech32String } from '../../../../core/types/types.ts';

export interface OperationContext {
  readonly transactionBuilder: TransactionBuilder;
  readonly pParams: ProtocolParams;
  readonly nContext: NetworkContext;
  readonly userAddress: Bech32String;
  readonly network: Network;
  readonly needCollateral?: boolean;
  readonly markNeedCollateral: () => void;
}

export type Operation<P extends any[]> = (
  ...params: P
) => (context: OperationContext) => Promise<any>;

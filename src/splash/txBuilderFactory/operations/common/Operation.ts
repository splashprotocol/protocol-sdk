import { TransactionBuilder } from '@dcspark/cardano-multiplatform-lib-browser';

import { Network } from '../../../../core/types/Network.ts';
import { NetworkContext } from '../../../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../../../core/types/ProtocolParams.ts';
import { Bech32String } from '../../../../core/types/types.ts';
import { Splash } from '../../../splash.ts';

export interface OperationContext {
  readonly transactionBuilder: TransactionBuilder;
  readonly pParams: ProtocolParams;
  readonly nContext: NetworkContext;
  readonly userAddress: Bech32String;
  readonly network: Network;
  readonly splash: Splash<{}>;
}

export type Operation<P extends any[]> = (
  ...params: P
) => (context: OperationContext) => Promise<any>;

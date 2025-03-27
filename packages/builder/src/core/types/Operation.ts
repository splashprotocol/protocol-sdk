import { Bech32String, Network } from '@splashprotocol/core';
import { TransactionCandidate } from '../models/TransactionCandidate/TransactionCandidate.ts';
import { UTxOsSelector } from '../utils/UTxOsSelector/UTxOsSelector.ts';
import { InferPromise } from './InferPromise.ts';
import { CML } from '../utils/Cml/Cml.ts';
import { BasicApi } from '@splashprotocol/api';
import { ProtocolParams } from './ProtocolParams.ts';
import { NetworkContext } from './NetworkContext.ts';
import { BuilderExplorer } from './BuilderExplorer.ts';

export interface OperationContext<A extends BasicApi> {
  readonly transactionCandidate: TransactionCandidate;
  readonly pParams: ProtocolParams;
  readonly nContext: NetworkContext;
  readonly uTxOsSelector: UTxOsSelector;
  readonly collateralSelector: UTxOsSelector;
  readonly userAddress: Bech32String;
  readonly network: Network;
  readonly api: A;
  readonly explorer: BuilderExplorer;
  readonly C: InferPromise<typeof CML>;
}

export type Operation<P extends any[], A extends BasicApi, R> = (
  ...params: P
) => (context: OperationContext<A>) => Promise<R>;

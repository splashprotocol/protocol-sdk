import { TransactionCandidate } from '../../../../core/models/transactionCandidate/TransactionCandidate.ts';
import { Network } from '../../../../core/types/Network.ts';
import { NetworkContext } from '../../../../core/types/NetworkContext.ts';
import { ProtocolParams } from '../../../../core/types/ProtocolParams.ts';
import { SplashOperationsConfig } from '../../../../core/types/SplashOperationsConfig.ts';
import { Bech32String } from '../../../../core/types/types.ts';
import { UTxOsSelector } from '../../../../core/utils/utxosSelector/UTxOsSelector.ts';
import { Splash } from '../../../splash.ts';
import { Utils } from '../../../utils/Utils.ts';

export interface OperationContext {
  readonly operationsConfig: SplashOperationsConfig;
  readonly transactionCandidate: TransactionCandidate;
  readonly pParams: ProtocolParams;
  readonly nContext: NetworkContext;
  readonly uTxOsSelector: UTxOsSelector;
  readonly collateralSelector: UTxOsSelector;
  readonly userAddress: Bech32String;
  readonly network: Network;
  readonly utils: Utils;
  readonly splash: Splash<{}>;
}

export type Operation<P extends any[]> = (
  ...params: P
) => (context: OperationContext) => Promise<any>;

import {
  Bech32String,
  CborHexString,
  Network,
  OutputReference,
  OutputReferenceHash,
  TransactionHash,
} from '@splashprotocol/core';
import { UTxO } from '../models/UTxO/UTxO.ts';
import { ProtocolParams } from './ProtocolParams.ts';
import { NetworkContext } from './NetworkContext.ts';

export interface BuilderExplorer {
  readonly network: Network;

  getProtocolParams(): Promise<ProtocolParams>;

  getNetworkContext(): Promise<NetworkContext>;

  getUTxOByRef(
    ref: OutputReference | OutputReferenceHash,
  ): Promise<UTxO | undefined>;

  getUTxOsByAddress(address: Bech32String): Promise<UTxO[]>;

  evaluateTx(cbor: CborHexString): Promise<any>;

  submitTx(signedTxCbor: CborHexString): Promise<TransactionHash>;
}

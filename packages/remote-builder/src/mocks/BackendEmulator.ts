import { Backend } from '@splashprotocol/api';
import { AssetInfoMetadata, Network } from '@splashprotocol/core';

export class BackendEmulator implements Backend<BackendEmulator> {
  network: Network = 'mainnet';

  getAssetMetadata(): Promise<AssetInfoMetadata | undefined> {
    throw new Error('Method not implemented.');
  }
}

import { CborHexString, HexString } from './types.ts';

interface Paging {
  readonly offset: number;
  readonly limit: number;
}

export interface CardanoCIP30WalletContext {
  getUtxos(
    amount?: CborHexString,
    paginate?: Paging,
  ): Promise<CborHexString[] | undefined>;
  getCollateral(params?: {
    amount?: CborHexString;
  }): Promise<CborHexString[] | undefined>;
  experimental: {
    getCollateral(params?: {
      amount?: CborHexString;
    }): Promise<CborHexString[] | undefined>;
    syncAccount?: () => Promise<boolean>;
  };
  getChangeAddress(): Promise<CborHexString>;
  getBalance(): Promise<CborHexString>;
  getUsedAddresses(paginate?: Paging): Promise<CborHexString[]>;
  getUnusedAddresses(paginate?: Paging): Promise<CborHexString[]>;
  signTx(tx: CborHexString, partialSign?: boolean): Promise<CborHexString>;
  signData(
    address: CborHexString,
    data: CborHexString,
  ): Promise<{ signature: HexString; key: HexString }>;
  getNetworkId(): Promise<number>;
  submitTx(tx: CborHexString): Promise<string>;
}
export interface CardanoCIP30WalletBridge {
  enable(): Promise<CardanoCIP30WalletContext>;
  isEnabled(): Promise<boolean>;
  readonly experimental?: any;
  readonly name: string;
}

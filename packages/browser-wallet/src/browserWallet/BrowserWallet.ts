export const a = 1;
// import {
//   Bech32String,
//   CborHexString,
//   Currencies,
//   HexString,
// } from '@splashprotocol/core';
// import { WalletStatus } from '../operations/getWalletStatus/types/WalletStatus.ts';
// import { IFrameConnector } from './IFrameConnector.ts';
//
// export class BrowserWallet {
//   private static iFrameConnector: IFrameConnector | undefined;
//
//   static create(): BrowserWallet {
//     if (!BrowserWallet.iFrameConnector) {
//       BrowserWallet.iFrameConnector = new IFrameConnector();
//     }
//     return new BrowserWallet(BrowserWallet.iFrameConnector);
//   }
//
//   private constructor(private readonly connector: IFrameConnector) {}
//
//   async getBalance(): Promise<Currencies> {}
//
//   async getAddress(): Promise<Bech32String> {}
//
//   async getPublicKey(): Promise<HexString> {}
//
//   async getStatus(): Promise<WalletStatus> {}
//
//   async signData(data: Uint8Array): Promise<Uint8Array> {}
//
//   async signTx(tx: CborHexString): Promise<HexString> {}
// }

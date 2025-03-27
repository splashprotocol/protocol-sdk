import {
  Bech32String,
  BlockHash,
  CborHexString,
  HexString,
  OutputReferenceHash,
  TransactionHash,
  uint,
} from '@splashprotocol/core';

export interface UTxODescriptorCurrency {
  readonly policyId: HexString;
  readonly name: HexString;
  readonly quantity: number;
  readonly jsQuantity: string;
  readonly nameHex: HexString;
}

export interface UTxODescriptor {
  readonly ref: OutputReferenceHash;
  readonly blockHash: BlockHash;
  readonly txHash: TransactionHash;
  readonly index: uint;
  readonly globalIndex: uint;
  readonly addr: Bech32String;
  readonly paymentCred: HexString;
  readonly value: UTxODescriptorCurrency[];
  readonly dataBin: CborHexString;
  readonly spentByTxHash: TransactionHash;
}

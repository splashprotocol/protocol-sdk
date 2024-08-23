import {
  Bech32String,
  BlockHash,
  CborHexString,
  HexString,
  OutputReferenceHash,
  TransactionHash,
  uint,
} from '../../../types/types.ts';

export interface RawUTxOCurrency {
  readonly policyId: HexString;
  readonly name: HexString;
  readonly quantity: number;
  readonly jsQuantity: string;
  readonly nameHex: HexString;
}

export interface RawUTxO {
  readonly ref: OutputReferenceHash;
  readonly blockHash: BlockHash;
  readonly txHash: TransactionHash;
  readonly index: uint;
  readonly globalIndex: uint;
  readonly addr: Bech32String;
  readonly paymentCred: HexString;
  readonly value: RawUTxOCurrency[];
  readonly dataBin: CborHexString;
  readonly spentByTxHash: TransactionHash;
}

import { Bech32String, CborHexString, HexString } from '@splashprotocol/core';

export interface RawUTxO {
  data: {
    tx_hash: string;
    index: number;
    assets: {
      unit: string;
      amount: number;
    }[];
    address: Bech32String;
    datum: { bytes: CborHexString };
    reference_script: {
      hash: HexString;
      type: 'plutusv2';
      bytes: CborHexString;
      json: null;
    };
    txout_cbor: null;
  };
  last_updated: {
    timestamp: string;
    block_hash: string;
    block_slot: number;
  };
}

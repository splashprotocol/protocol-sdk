import { bytesToHex, hexToBytes, OutputReference } from '@splashprotocol/core';
import { Uint64BE } from 'int64-buffer';
import { blake2b224 } from '../../../../../core/utils/blake2b224/blake2b224.ts';
import { CML } from '../../../../../core/utils/Cml/Cml.ts';
import {
  SpotOrderDatum,
  spotOrderDatum,
} from '../spotOrderDatum/spotOrderDatum.ts';

const EMPTY_BEACON = bytesToHex(Uint8Array.from(new Array(28).fill(0)));

export interface SpotOrderBeaconParams {
  readonly outputReference: OutputReference;
  readonly orderIndex: bigint;
  readonly datumObject: Omit<SpotOrderDatum, 'beacon'>;
}

export const spotOrderBeacon = async ({
  outputReference,
  orderIndex,
  datumObject,
}: SpotOrderBeaconParams): Promise<string> => {
  const C = await CML;

  return blake2b224(
    Uint8Array.from([
      ...C.TransactionHash.from_hex(outputReference.txHash).to_raw_bytes(),
      ...new Uint64BE(Number(outputReference.index)).toArray(),
      ...new Uint64BE(Number(orderIndex)).toArray(),
      ...hexToBytes(
        await blake2b224(
          C.PlutusData.from_cbor_hex(
            await spotOrderDatum.serialize({
              ...datumObject,
              beacon: EMPTY_BEACON,
            }),
          ).to_cbor_bytes(),
        ),
      ),
    ]),
  );
};

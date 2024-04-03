import {
  Address,
  BaseAddress,
  Credential,
  Ed25519KeyHash,
  EnterpriseAddress,
  NetworkId,
  PlutusData,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Bech32String } from '../../../../types/types.ts';
import { DataType, toDataType } from '../../common/DataType.ts';
import { BytesDataType } from '../BytesDataType/BytesDataType.ts';
import { OptionalDataType } from '../OptionalDataType/OptionalDataType.ts';
import { TupleDataType } from '../TupleDataType/TupleDataType.ts';

const AddressTuple = TupleDataType([
  BytesDataType,
  OptionalDataType(BytesDataType),
]);

export const AddressDataType = (networkId: NetworkId): DataType<Bech32String> =>
  toDataType({
    serialize(rawAddress: Bech32String): PlutusData {
      const address = BaseAddress.from_address(Address.from_bech32(rawAddress));
      const paymentKeyHash = address?.payment().as_pub_key()?.to_hex();
      const stakeKeyHash = address?.stake().as_pub_key()?.to_hex();

      if (!paymentKeyHash) {
        throw new Error('payment key hash not found');
      }

      return AddressTuple([paymentKeyHash, stakeKeyHash]);
    },
    deserialize(data: PlutusData) {
      const [paymentKeyHash, stakeKeyHash] = AddressTuple.deserialize(data);

      if (stakeKeyHash) {
        return BaseAddress.new(
          Number(networkId.network()),
          Credential.new_pub_key(Ed25519KeyHash.from_hex(paymentKeyHash)),
          Credential.new_pub_key(Ed25519KeyHash.from_hex(stakeKeyHash)),
        )
          .to_address()
          .to_bech32();
      }

      return EnterpriseAddress.new(
        Number(networkId.network()),
        Credential.new_pub_key(Ed25519KeyHash.from_hex(paymentKeyHash)),
      )
        .to_address()
        .to_bech32();
    },
  });

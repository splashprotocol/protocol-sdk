import { HexString } from '../../types/HexString.ts';
import { BaseAddress } from '../../models/address/BaseAddress/BaseAddress.ts';
import { hexToBytes } from '../encoding/hexToBytes/hexToBytes.ts';
import { unpackKind } from '../../models/address/common/helpers/unpackKind/unpackKind.ts';
import { AddressKind } from '../../models/address/common/types/AddressKind.ts';
import { EnterpriseAddress } from '../../models/address/EnterpriseAddress/EnterpriseAddress.ts';

export const AddressUtils = {
  fromHex(addressHex: HexString): BaseAddress | EnterpriseAddress {
    const bytes = hexToBytes(addressHex);
    const kind = unpackKind(bytes);

    switch (kind) {
      case AddressKind.BasePaymentKeyStakeKey:
      case AddressKind.BasePaymentScriptStakeScript:
      case AddressKind.BasePaymentScriptStakeKey:
      case AddressKind.BasePaymentKeyStakeScript:
        return BaseAddress['fromKindAndBytes'](kind, bytes);
      case AddressKind.EnterpriseScript:
      case AddressKind.EnterpriseKey:
        return EnterpriseAddress['fromKindAndBytes'](kind, bytes);
      default:
        throw new Error(`can\`t find address type for ${addressHex} hex`);
    }
  },
};

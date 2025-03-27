import { AddressKind } from '../../types/AddressKind.ts';

export const getBech32Prefix = (kind: AddressKind, network: 0 | 1): string => {
  let prefix = '';
  switch (kind) {
    case AddressKind.BasePaymentKeyStakeKey:
    case AddressKind.BasePaymentScriptStakeKey:
    case AddressKind.BasePaymentKeyStakeScript:
    case AddressKind.BasePaymentScriptStakeScript:
    case AddressKind.PointerKey:
    case AddressKind.PointerScript:
    case AddressKind.EnterpriseKey:
    case AddressKind.EnterpriseScript:
      prefix = 'addr';
      break;
    case AddressKind.RewardKey:
    case AddressKind.RewardScript: {
      prefix = 'stake';
      break;
    }
    default:
      throw new Error('Invalid address'); // Shouldn't happen
  }

  prefix += network === 0 ? '_test' : '';

  return prefix;
};

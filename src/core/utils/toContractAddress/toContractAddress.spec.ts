import { NetworkId } from '@dcspark/cardano-multiplatform-lib-browser';

import { toContractAddress } from './toContractAddress.ts';

test('it should returns valid address from script', () => {
  expect(toContractAddress(NetworkId.testnet(), scripts.spotOrders)).toBe(
    'addr_test1wr064qxfwvhd8dm49wscj7r8y0r8p83gw6szf785mxgslvcpj2au0',
  );
});

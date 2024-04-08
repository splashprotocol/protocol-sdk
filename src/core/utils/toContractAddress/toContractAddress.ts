import {
  Credential,
  EnterpriseAddress,
  NetworkId,
  ScriptHash,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Bech32String } from '../../types/types.ts';

/**
 * Returns contract address from networkId and script
 * @param {NetworkId} network
 * @param {string} script
 * @return {Bech32String}
 */
export const toContractAddress = (
  network: NetworkId,
  script: string,
): Bech32String =>
  EnterpriseAddress.new(
    Number(network),
    Credential.new_script(ScriptHash.from_hex(script)),
  )
    .to_address()
    .to_bech32();

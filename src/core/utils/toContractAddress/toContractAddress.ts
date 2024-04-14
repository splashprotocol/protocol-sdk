import {
  BaseAddress,
  Credential,
  Ed25519KeyHash,
  EnterpriseAddress,
  NetworkId,
  ScriptHash,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Bech32String } from '../../types/types.ts';

/**
 * Returns contract address from networkId and script
 * @param {NetworkId} network
 * @param {string} script
 * @param {string} stakeKeyHash
 * @return {Bech32String}
 */
export const toContractAddress = (
  network: NetworkId,
  script: string,
  stakeKeyHash?: string,
): Bech32String =>
  stakeKeyHash
    ? BaseAddress.new(
        Number(network),
        Credential.new_script(ScriptHash.from_hex(script)),
        Credential.new_pub_key(Ed25519KeyHash.from_hex(stakeKeyHash)),
      )
        .to_address()
        .to_bech32()
    : EnterpriseAddress.new(
        Number(network),
        Credential.new_script(ScriptHash.from_hex(script)),
      )
        .to_address()
        .to_bech32();

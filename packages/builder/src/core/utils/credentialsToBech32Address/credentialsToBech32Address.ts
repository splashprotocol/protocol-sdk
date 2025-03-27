import { Bech32String, Network } from '@splashprotocol/core';
import { CML } from '../Cml/Cml.ts';
import { Credentials } from '../../types/Credentials.ts';

export const credentialsToBech32Address = async (
  network: Network,
  paymentCredentials: Credentials,
  stakeCredentials?: Credentials,
): Promise<Bech32String> => {
  const C = await CML;

  const paymentCred =
    paymentCredentials.type === 'script'
      ? C.Credential.new_script(C.ScriptHash.from_hex(paymentCredentials.hash))
      : C.Credential.new_pub_key(
          C.Ed25519KeyHash.from_hex(paymentCredentials.hash),
        );
  const stakeCred =
    stakeCredentials?.type === 'script'
      ? C.Credential.new_script(C.ScriptHash.from_hex(stakeCredentials.hash))
      : stakeCredentials
        ? C.Credential.new_pub_key(
            C.Ed25519KeyHash.from_hex(stakeCredentials.hash),
          )
        : undefined;
  const networkId = Number(
    network === 'mainnet'
      ? C.NetworkId.mainnet().network()
      : C.NetworkId.testnet().network(),
  );
  return stakeCred
    ? C.BaseAddress.new(networkId, paymentCred, stakeCred)
        .to_address()
        .to_bech32()
    : C.EnterpriseAddress.new(networkId, paymentCred).to_address().to_bech32();
};

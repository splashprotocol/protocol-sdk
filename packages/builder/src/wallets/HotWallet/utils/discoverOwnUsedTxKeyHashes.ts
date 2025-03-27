import { Bech32String, HexString } from '@splashprotocol/core';
import {
  MapRewardAccountToCoin,
  NativeScriptList,
  Transaction,
  TransactionBody,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { UTxO } from '../../../core/models/UTxO/UTxO.ts';
import { InferPromise } from '../../../core/types/InferPromise.ts';
import { CML } from '../../../core/utils/Cml/Cml.ts';

export function discoverOwnUsedTxKeyHashes(
  tx: Transaction,
  ownKeyHashes: Array<HexString>,
  ownUtxos: Array<UTxO>,
  C: InferPromise<typeof CML>,
): Array<HexString> {
  const usedKeyHashes: HexString[] = [];
  const getAddressDetails = (
    address: Bech32String,
  ): { paymentCredential: HexString } => {
    const wasmAddr = C.Address.from_bech32(address);

    if (wasmAddr.payment_cred()?.as_pub_key()?.to_hex()) {
      return {
        paymentCredential: wasmAddr.payment_cred()?.as_pub_key()?.to_hex()!,
      };
    }
    if (wasmAddr.payment_cred()?.as_script()?.to_hex()) {
      return {
        paymentCredential: wasmAddr.payment_cred()?.as_script()?.to_hex()!,
      };
    }
    return { paymentCredential: '' };
  };

  // key hashes from inputs
  const inputs = tx.body().inputs();
  for (let i = 0; i < inputs.len(); i++) {
    const input = inputs.get(i);
    const txHash = input.transaction_id().to_hex();
    const outputIndex = Number(input.index());
    const utxo = ownUtxos.find(
      (utxo) => utxo.txHash === txHash && Number(utxo.index) === outputIndex,
    );
    if (utxo) {
      const { paymentCredential } = getAddressDetails(utxo.address);
      usedKeyHashes.push(paymentCredential);
    }
  }

  const txBody = tx.body();

  // key hashes from certificates
  function keyHashFromCert(txBody: TransactionBody) {
    const certs = txBody.certs();
    if (!certs) return;
    for (let i = 0; i < certs.len(); i++) {
      const cert = certs.get(i);
      switch (cert.kind()) {
        case 0:
          // Key hash not needed for registration
          break;

        case 1: {
          const credential = cert.as_stake_deregistration()?.stake_credential();
          switch (credential?.kind()) {
            case 0:
              usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
              break;
            case 1:
              usedKeyHashes.push(credential.as_script()?.to_hex()!);
              break;
          }
          break;
        }
        case 2: {
          //TODO: Missing test
          const credential = cert.as_stake_delegation()?.stake_credential();
          if (credential?.kind() === 0) {
            const keyHash = credential.as_pub_key()?.to_hex()!;
            usedKeyHashes.push(keyHash);
          }

          break;
        }
        case 3: {
          //TODO: Missing test
          const poolParams = cert.as_pool_registration()?.pool_params()!;
          const owners = poolParams?.pool_owners();
          if (!owners) break;
          for (let i = 0; i < owners.len(); i++) {
            const keyHash = owners.get(i).to_hex();
            usedKeyHashes.push(keyHash);
          }
          const operator = poolParams.operator().to_hex();
          usedKeyHashes.push(operator);

          break;
        }

        case 4: {
          //TODO: Missing test
          const operator = cert.as_pool_retirement()?.pool().to_hex()!;
          usedKeyHashes.push(operator);

          break;
        }

        case 6: {
          //TODO: Missing test
          const credential = cert.as_unreg_cert()?.stake_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 7: {
          //TODO: Missing test
          const credential = cert.as_vote_deleg_cert()?.stake_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 8: {
          //TODO: Missing test
          const credential = cert
            .as_stake_vote_deleg_cert()
            ?.stake_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 9: {
          //TODO: Missing test
          const credential = cert.as_stake_reg_deleg_cert()?.stake_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 10: {
          //TODO: Missing test
          const credential = cert.as_vote_reg_deleg_cert()?.stake_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 11: {
          //TODO: Missing test
          const credential = cert
            .as_stake_vote_reg_deleg_cert()
            ?.stake_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 12: {
          //TODO: Missing test
          const credential = cert
            .as_auth_committee_hot_cert()
            ?.committee_cold_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 13: {
          //TODO: Missing test
          const credential = cert
            .as_resign_committee_cold_cert()
            ?.committee_cold_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 14: {
          //TODO: Missing test
          const credential = cert.as_reg_drep_cert()?.drep_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 15: {
          //TODO: Missing test
          const credential = cert.as_unreg_drep_cert()?.drep_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        case 16: {
          //TODO: Missing test
          const credential = cert.as_update_drep_cert()?.drep_credential();
          if (credential) {
            usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          }
          break;
        }

        default:
          //TODO: Missing certificates
          break;
      }
    }
  }
  if (txBody.certs()) keyHashFromCert(txBody);

  // key hashes from withdrawals

  const withdrawals = txBody.withdrawals();
  function keyHashFromWithdrawal(withdrawals: MapRewardAccountToCoin) {
    const rewardAddresses = withdrawals.keys();
    for (let i = 0; i < rewardAddresses.len(); i++) {
      const credential = rewardAddresses.get(i).payment();
      switch (credential.kind()) {
        case 0:
          usedKeyHashes.push(credential.as_pub_key()?.to_hex()!);
          break;
        case 1:
          usedKeyHashes.push(credential.as_script()?.to_hex()!);
          break;
      }
    }
  }
  if (withdrawals) keyHashFromWithdrawal(withdrawals);

  // key hashes from scripts
  const scripts = tx.witness_set().native_scripts();
  function keyHashFromScript(scripts: NativeScriptList) {
    for (let i = 0; i < scripts.len(); i++) {
      const script = scripts.get(i);
      if (script.kind() === 0) {
        const keyHash = script.as_script_pubkey()?.ed25519_key_hash().to_hex()!;
        usedKeyHashes.push(keyHash);
      }
      if (script.kind() === 1) {
        keyHashFromScript(script.as_script_all()!.native_scripts());
        return;
      }
      if (script.kind() === 2) {
        keyHashFromScript(script.as_script_any()!.native_scripts());
        return;
      }
      if (script.kind() === 3) {
        keyHashFromScript(script.as_script_n_of_k()!.native_scripts());
        return;
      }
    }
  }
  if (scripts) keyHashFromScript(scripts);

  // keyHashes from required signers
  const requiredSigners = txBody.required_signers();
  if (requiredSigners) {
    for (let i = 0; i < requiredSigners.len(); i++) {
      usedKeyHashes.push(requiredSigners.get(i).to_hex());
    }
  }

  // keyHashes from collateral
  const collateral = txBody.collateral_inputs();
  if (collateral) {
    for (let i = 0; i < collateral.len(); i++) {
      const input = collateral.get(i);
      const txHash = input.transaction_id().to_hex();
      const outputIndex = Number(input.index());
      const utxo = ownUtxos.find(
        (utxo) => utxo.txHash === txHash && Number(utxo.index) === outputIndex,
      );
      if (utxo) {
        const { paymentCredential } = getAddressDetails(utxo.address);
        usedKeyHashes.push(paymentCredential);
      }
    }
  }

  return usedKeyHashes.filter((k) => ownKeyHashes.includes(k));
}

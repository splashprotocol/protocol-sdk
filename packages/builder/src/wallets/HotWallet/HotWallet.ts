import { CardanoCIP30WalletContext } from '@splashprotocol/api/src/types/CardanoCIP30WalletBridge.ts';
import {
  Bech32String,
  CborHexString,
  Currencies,
  HexString,
  hexToBytes,
  stringToBytes,
} from '@splashprotocol/core';
import { CML } from '../../core/utils/Cml/Cml.ts';
import { InferPromise } from '../../core/types/InferPromise.ts';
import { mnemonicToEntropy } from 'bip39';
import { BuilderExplorer } from '../../core/types/BuilderExplorer.ts';
import { toWasmValue } from '../../core/models/Output/Output.ts';
import {
  Ed25519KeyHash,
  PrivateKey,
} from '@dcspark/cardano-multiplatform-lib-browser';
import { discoverOwnUsedTxKeyHashes } from './utils/discoverOwnUsedTxKeyHashes.ts';
import { UTxO } from '../../core/models/UTxO/UTxO.ts';

export interface WalletFromSeedOptions {
  password?: string;
  addressType?: 'Base' | 'Enterprise';
  accountIndex?: number;
}

const DEFAULT_OPTIONS: WalletFromSeedOptions = {
  accountIndex: 0,
  addressType: 'Base',
};

interface SeedWalletConfig {
  readonly paymentKey: PrivateKey;
  readonly stakeKey: PrivateKey;
  readonly paymentKeyHash: Ed25519KeyHash;
  readonly stakeKeyHash: Ed25519KeyHash;
}

function harden(num: number): number {
  if (typeof num !== 'number') throw new Error('Type number required here!');
  return 0x80000000 + num;
}

export class HotWallet implements CardanoCIP30WalletContext {
  static async fromSeed(
    seed: string,
    explorer: BuilderExplorer,
    params: WalletFromSeedOptions = DEFAULT_OPTIONS,
  ): Promise<HotWallet> {
    const C = await CML;
    const normalizedParams = { ...params, ...DEFAULT_OPTIONS };
    const entropy = mnemonicToEntropy(seed);
    const rootKey = C.Bip32PrivateKey.from_bip39_entropy(
      hexToBytes(entropy),
      normalizedParams.password
        ? stringToBytes(normalizedParams.password)
        : new Uint8Array(),
    );

    const accountKey = rootKey
      .derive(harden(1852))
      .derive(harden(1815))
      .derive(harden(normalizedParams.accountIndex!));

    rootKey.free();

    const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
    const stakeKey = accountKey.derive(2).derive(0).to_raw_key();

    const paymentKeyHash = paymentKey.to_public().hash();
    const stakeKeyHash = stakeKey.to_public().hash();

    const networkId = explorer.network === 'mainnet' ? 1 : 0;

    const address =
      normalizedParams.addressType === 'Base'
        ? C.BaseAddress.new(
            networkId,
            C.Credential.new_pub_key(paymentKeyHash),
            C.Credential.new_pub_key(stakeKeyHash),
          )
            .to_address()
            .to_bech32(undefined)
        : C.EnterpriseAddress.new(
            networkId,
            C.Credential.new_pub_key(paymentKeyHash),
          )
            .to_address()
            .to_bech32(undefined);

    return new HotWallet(C, explorer, address, {
      paymentKey,
      stakeKey,
      paymentKeyHash,
      stakeKeyHash,
    });
  }

  private constructor(
    private C: InferPromise<typeof CML>,
    private explorer: BuilderExplorer,
    private address: Bech32String,
    private additionalConfig: SeedWalletConfig,
  ) {}

  readonly experimental = undefined as any;

  async getUtxos(): Promise<CborHexString[] | undefined> {
    return this.explorer
      .getUTxOsByAddress(this.address)
      .then((uTxOs) => uTxOs.map((uTxo) => uTxo.cbor));
  }

  async getCollateral(): Promise<CborHexString[] | undefined> {
    return this.explorer
      .getUTxOsByAddress(this.address)
      .then((uTxOs) =>
        uTxOs.filter(
          (uTxO) =>
            uTxO.value.ada.isPositive() && uTxO.value.toArray().length === 1,
        ),
      )
      .then((uTxOs) => uTxOs.map((uTxo) => uTxo.cbor));
  }

  async getChangeAddress(): Promise<CborHexString> {
    return Promise.resolve(this.C.Address.from_bech32(this.address).to_hex());
  }

  async getBalance(): Promise<CborHexString> {
    return this.explorer
      .getUTxOsByAddress(this.address)
      .then((uTxOs) =>
        uTxOs.reduce(
          (balance, uTxO) => balance.plus(uTxO.value),
          Currencies.empty,
        ),
      )
      .then((currencies) => toWasmValue(this.C, currencies).to_cbor_hex());
  }

  async getUsedAddresses(): Promise<CborHexString[]> {
    return Promise.resolve([this.C.Address.from_bech32(this.address).to_hex()]);
  }

  async getUnusedAddresses(): Promise<CborHexString[]> {
    return Promise.resolve([]);
  }

  async getNetworkId(): Promise<number> {
    return Promise.resolve(this.explorer.network === 'mainnet' ? 1 : 0);
  }

  async submitTx(signedTxCbor: CborHexString): Promise<CborHexString> {
    return this.explorer.submitTx(signedTxCbor);
  }

  async signTx(
    txCbor: CborHexString,
    _?: boolean,
    includedUTxOs?: UTxO[],
  ): Promise<CborHexString> {
    const wasmTx = this.C.Transaction.from_cbor_hex(txCbor);
    const utxos =
      includedUTxOs || (await this.explorer.getUTxOsByAddress(this.address));
    const privKeyHashMap = {
      [this.additionalConfig.paymentKeyHash.to_hex()]:
        this.additionalConfig.paymentKey,
      [this.additionalConfig.stakeKeyHash.to_hex()]:
        this.additionalConfig.stakeKey,
    };

    const ownKeyHashes: Array<HexString> = [
      this.additionalConfig.paymentKeyHash.to_hex(),
      this.additionalConfig.stakeKeyHash.to_hex(),
    ];

    const usedKeyHashes = discoverOwnUsedTxKeyHashes(
      wasmTx,
      ownKeyHashes,
      utxos || [],
      this.C,
    );

    const txWitnessSetBuilder = this.C.TransactionWitnessSetBuilder.new();
    for (const keyHash of usedKeyHashes) {
      const priv = privKeyHashMap[keyHash]!;
      const witness = this.C.make_vkey_witness(
        this.C.hash_transaction(wasmTx.body()),
        priv,
      );
      txWitnessSetBuilder.add_vkey(witness);
    }

    return txWitnessSetBuilder.build().to_cbor_hex();
  }
}

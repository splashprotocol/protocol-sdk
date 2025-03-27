import { Address } from '../common/types/Address.ts';
import { AddressKind } from '../common/types/AddressKind.ts';
import { HexString } from '../../../types/HexString.ts';
import { Bech32String } from '../../../types/Bech32String.ts';
import { bech32 } from 'bech32';
import { BECH32_LIMIT } from '../common/constants/bech32Limit.ts';
import { hexToBytes } from '../../../utils/encoding/hexToBytes/hexToBytes.ts';
import { unpackKind } from '../common/helpers/unpackKind/unpackKind.ts';
import { bytesToHex } from '../../../utils/encoding/bytesToHex/bytesToHex.ts';
import { assertBech32 } from '../common/asserts/assertBech32.ts';
import { assertBytesLength } from '../common/asserts/assertBytesLength.ts';
import { Credential } from '../common/types/Credential.ts';
import { CredentialType } from '../common/types/CredentialType.ts';
import { getBech32Prefix } from '../common/helpers/getBech32Prefix/getBech32Prefix.ts';
import { packKind } from '../common/helpers/packKind/packKind.ts';
import { Network } from '../../../types/Network.ts';

interface BaseAddressConfig {
  readonly network: 0 | 1;
  readonly bech32: Bech32String;
  readonly hex: HexString;
  readonly payment: Credential;
  readonly stake: Credential;
}

export class BaseAddress implements Address {
  static fromBytes(bytes: Uint8Array | Buffer): BaseAddress {
    if (bytes.length !== 57) {
      throw new Error('Base address data length should be 57 bytes long.');
    }
    const kind = unpackKind(bytes);
    if (
      ![
        AddressKind.BasePaymentKeyStakeKey,
        AddressKind.BasePaymentKeyStakeScript,
        AddressKind.BasePaymentScriptStakeKey,
        AddressKind.BasePaymentScriptStakeScript,
      ].includes(kind)
    ) {
      throw new Error('no kind match for BaseAddress');
    }

    return BaseAddress.fromKindAndBytes(kind, bytes);
  }

  static fromHex(hex: HexString): BaseAddress {
    return BaseAddress.fromBytes(hexToBytes(hex));
  }

  static fromBech32(bech32Str: Bech32String): BaseAddress {
    assertBech32(bech32Str);

    return BaseAddress.fromBytes(
      Uint8Array.from(
        bech32.fromWords(bech32.decode(bech32Str, BECH32_LIMIT).words),
      ),
    );
  }

  private static fromKindAndBytes(
    kind: AddressKind,
    bytes: Uint8Array | Buffer,
  ): BaseAddress {
    assertBytesLength(bytes, 57);

    const network = bytes[0] & 0b0000_1111;

    const paymentCredentialBytes = bytes.slice(1, 29);
    const paymentCredential = bytesToHex(paymentCredentialBytes);
    const paymentCredentialType =
      kind === AddressKind.BasePaymentScriptStakeKey ||
      kind === AddressKind.BasePaymentScriptStakeScript
        ? CredentialType.ScriptHash
        : CredentialType.KeyHash;

    const stakeCredentialBytes = bytes.slice(29, 57);
    const stakeCredential = bytesToHex(stakeCredentialBytes);
    const stakeCredentialType =
      kind === AddressKind.BasePaymentKeyStakeScript ||
      kind === AddressKind.BasePaymentScriptStakeScript
        ? CredentialType.ScriptHash
        : CredentialType.KeyHash;

    const words = Uint8Array.from([
      ...Uint8Array.from([packKind(kind) | network!]),
      ...paymentCredentialBytes,
      ...stakeCredentialBytes,
    ]);
    const bech32String = bech32.encode(
      getBech32Prefix(kind, network as any),
      bech32.toWords(words),
      BECH32_LIMIT,
    );

    return new BaseAddress({
      bech32: bech32String,
      hex: bytesToHex(bytes),
      payment: { type: paymentCredentialType, hash: paymentCredential },
      stake: { type: stakeCredentialType, hash: stakeCredential },
      network: network as any,
    });
  }

  readonly payment: Credential;

  readonly stake: Credential;

  readonly network: Network;

  private constructor(private config: BaseAddressConfig) {
    this.payment = config.payment;
    this.stake = config.stake;
    this.network = config.network === 1 ? 'mainnet' : 'preprod';
  }

  toBech32(): Bech32String {
    return this.config.bech32;
  }

  toHex(): Bech32String {
    return this.config.hex;
  }
}

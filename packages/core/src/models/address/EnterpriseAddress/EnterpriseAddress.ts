import { Bech32String } from '../../../types/Bech32String.ts';
import { HexString } from '../../../types/HexString.ts';
import { Credential } from '../common/types/Credential.ts';
import { Address } from '../common/types/Address.ts';
import { unpackKind } from '../common/helpers/unpackKind/unpackKind.ts';
import { AddressKind } from '../common/types/AddressKind.ts';
import { hexToBytes } from '../../../utils/encoding/hexToBytes/hexToBytes.ts';
import { assertBech32 } from '../common/asserts/assertBech32.ts';
import { bech32 } from 'bech32';
import { BECH32_LIMIT } from '../common/constants/bech32Limit.ts';
import { assertBytesLength } from '../common/asserts/assertBytesLength.ts';
import { bytesToHex } from '../../../utils/encoding/bytesToHex/bytesToHex.ts';
import { CredentialType } from '../common/types/CredentialType.ts';
import { packKind } from '../common/helpers/packKind/packKind.ts';
import { getBech32Prefix } from '../common/helpers/getBech32Prefix/getBech32Prefix.ts';
import { Network } from '../../../types/Network.ts';

interface BaseAddressConfig {
  readonly network: 0 | 1;
  readonly bech32: Bech32String;
  readonly hex: HexString;
  readonly payment: Credential;
}

export class EnterpriseAddress implements Address {
  static fromBytes(bytes: Uint8Array | Buffer): EnterpriseAddress {
    assertBytesLength(bytes, 29);
    const kind = unpackKind(bytes);
    if (
      ![AddressKind.EnterpriseKey, AddressKind.EnterpriseScript].includes(kind)
    ) {
      throw new Error('no kind match for EnterpriseAddress');
    }

    return EnterpriseAddress.fromKindAndBytes(kind, bytes);
  }

  static fromHex(hex: HexString): EnterpriseAddress {
    return EnterpriseAddress.fromBytes(hexToBytes(hex));
  }

  static fromBech32(bech32Str: Bech32String): EnterpriseAddress {
    assertBech32(bech32Str);

    return EnterpriseAddress.fromBytes(
      Uint8Array.from(
        bech32.fromWords(bech32.decode(bech32Str, BECH32_LIMIT).words),
      ),
    );
  }

  private static fromKindAndBytes(
    kind: AddressKind,
    bytes: Uint8Array | Buffer,
  ): EnterpriseAddress {
    assertBytesLength(bytes, 29);

    const network = bytes[0] & 0b0000_1111;

    const paymentCredentialBytes = bytes.slice(1, 29);
    const paymentCredential = bytesToHex(paymentCredentialBytes);
    const paymentCredentialType =
      kind === AddressKind.EnterpriseScript
        ? CredentialType.ScriptHash
        : CredentialType.KeyHash;

    const words = Uint8Array.from([
      ...Uint8Array.from([packKind(kind) | network!]),
      ...paymentCredentialBytes,
    ]);
    const bech32String = bech32.encode(
      getBech32Prefix(kind, network as any),
      bech32.toWords(words),
      BECH32_LIMIT,
    );

    return new EnterpriseAddress({
      bech32: bech32String,
      hex: bytesToHex(bytes),
      payment: { type: paymentCredentialType, hash: paymentCredential },
      network: network as any,
    });
  }

  readonly payment: Credential;

  readonly network: Network;

  private constructor(private config: BaseAddressConfig) {
    this.payment = config.payment;
    this.network = config.network === 1 ? 'mainnet' : 'preprod';
  }

  toBech32(): Bech32String {
    return this.config.bech32;
  }

  toHex(): Bech32String {
    return this.config.hex;
  }
}

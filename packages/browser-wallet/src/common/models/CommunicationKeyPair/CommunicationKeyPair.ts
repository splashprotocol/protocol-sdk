const KEY_ALGORITHM = {
  name: 'ECDSA',
  namedCurve: 'P-384',
  hash: 'SHA-512',
};

export class CommunicationPrivateKey {
  static async fromBytes(bytes: Uint8Array): Promise<CommunicationPrivateKey> {
    return new CommunicationPrivateKey(
      await crypto.subtle.importKey('spki', bytes, KEY_ALGORITHM, true, [
        'sign',
      ]),
    );
  }

  constructor(private cryptoKey: CryptoKey) {}

  async sign(data: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(
      await crypto.subtle.sign(
        {
          name: KEY_ALGORITHM.name,
          hash: KEY_ALGORITHM.hash,
        },
        this.cryptoKey,
        data,
      ),
    );
  }

  async toBytes(): Promise<Uint8Array> {
    return new Uint8Array(
      await crypto.subtle.exportKey('spki', this.cryptoKey),
    );
  }

  async destroy() {
    // (await this.toBytes()).fill(0);
  }
}

export class CommunicationPublicKey {
  static async fromBytes(bytes: Uint8Array): Promise<CommunicationPublicKey> {
    return new CommunicationPublicKey(
      await crypto.subtle.importKey('spki', bytes, KEY_ALGORITHM, true, [
        'verify',
      ]),
    );
  }

  constructor(private cryptoKey: CryptoKey) {}

  async verify(data: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return await crypto.subtle.verify(
      {
        name: KEY_ALGORITHM.name,
        hash: KEY_ALGORITHM.hash,
      },
      this.cryptoKey,
      signature,
      data,
    );
  }

  async toBytes(): Promise<Uint8Array> {
    return new Uint8Array(
      await crypto.subtle.exportKey('spki', this.cryptoKey),
    );
  }

  async destroy() {
    (await this.toBytes()).fill(0);
  }
}

export class CommunicationKeyPair {
  static async create(): Promise<CommunicationKeyPair> {
    const pair = await crypto.subtle.generateKey(KEY_ALGORITHM, false, [
      'sign',
      'verify',
    ]);

    return new CommunicationKeyPair(
      new CommunicationPrivateKey(pair.privateKey),
      new CommunicationPublicKey(pair.publicKey),
    );
  }

  private constructor(
    public readonly privateKey: CommunicationPrivateKey,
    public readonly publicKey: CommunicationPublicKey,
  ) {}

  async destroy() {
    return Promise.all([this.privateKey.destroy(), this.publicKey.destroy()]);
  }
}

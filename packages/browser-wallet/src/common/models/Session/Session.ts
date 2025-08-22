import { encoder } from 'js-encoding-utils';
import {
  CommunicationKeyPair,
  CommunicationPublicKey,
} from '../CommunicationKeyPair/CommunicationKeyPair.ts';

export class Session {
  private static getEncryptionKey() {
    return crypto.subtle.importKey(
      'raw',
      crypto.getRandomValues(new Uint8Array(32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  private static async generateId() {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const date = Date.now();
    const encryptionKey = await Session.getEncryptionKey();
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
        additionalData: encoder.stringToArrayBuffer('session-id'),
      },
      encryptionKey,
      encoder.stringToArrayBuffer(date.toString()),
    );

    return {
      iv,
      data: encoder.arrayBufferToHexString(encrypted),
      date: date.toString(),
      encryptionKey,
    };
  }

  static async create(anotherSidePublicKey: CommunicationPublicKey) {
    const communicationResponseKeys = await CommunicationKeyPair.create();
    const id = await this.generateId();

    return new Session(communicationResponseKeys, anotherSidePublicKey, id);
  }

  private constructor(
    public readonly communicationResponseKeys: CommunicationKeyPair,
    public readonly anotherSidePublicKey: CommunicationPublicKey,
    public readonly id: {
      iv: Uint8Array;
      data: string;
      date: string;
      encryptionKey: CryptoKey;
    },
  ) {}

  async verifyId(id: string) {
    const date = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: this.id.iv,
        additionalData: encoder.stringToArrayBuffer('session-id'),
        tagLength: 128,
      },
      this.id.encryptionKey,
      encoder.hexStringToArrayBuffer(id),
    );

    return this.id.date === encoder.arrayBufferToString(date);
  }

  async destroy() {
    return Promise.all([
      this.communicationResponseKeys.destroy(),
      this.anotherSidePublicKey.destroy(),
    ]);
  }
}

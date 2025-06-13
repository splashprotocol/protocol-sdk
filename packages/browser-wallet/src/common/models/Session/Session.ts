import { encoder } from 'js-encoding-utils';
import {
  CommunicationKeyPair,
  CommunicationPublicKey,
} from '../CommunicationKeyPair/CommunicationKeyPair.ts';

export class Session {
  private static lastDate: number;

  private static encryptionKeyBytes = crypto.getRandomValues(
    new Uint8Array(32),
  );

  private static getEncryptionKey() {
    return crypto.subtle.importKey(
      'raw',
      Session.encryptionKeyBytes,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  private static async generateId() {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    Session.lastDate = Date.now();
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
        additionalData: encoder.stringToArrayBuffer('session-id'),
      },
      await Session.getEncryptionKey(),
      encoder.stringToArrayBuffer(Session.lastDate.toString()),
    );

    return { iv, data: encoder.arrayBufferToHexString(encrypted) };
  }

  static async verifyId(id: string, iv: Uint8Array) {
    const date = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        additionalData: encoder.stringToArrayBuffer('session-id'),
        tagLength: 128,
      },
      await Session.getEncryptionKey(),
      encoder.hexStringToArrayBuffer(id),
    );

    return this.lastDate === Number(encoder.arrayBufferToString(date));
  }

  static async create(anotherSidePublicKey: CommunicationPublicKey) {
    const communicationResponseKeys = await CommunicationKeyPair.create();
    const id = await this.generateId();

    return new Session(communicationResponseKeys, anotherSidePublicKey, id);
  }

  private constructor(
    public readonly communicationResponseKeys: CommunicationKeyPair,
    public readonly anotherSidePublicKey: CommunicationPublicKey,
    public readonly id: { iv: Uint8Array; data: string },
  ) {}

  async destroy() {
    return Promise.all([
      this.communicationResponseKeys.destroy(),
      this.anotherSidePublicKey.destroy(),
    ]);
  }
}

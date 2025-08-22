import { sessionIdValidator } from './sessionIdValidator.ts';
import { Session } from '../../models/Session/Session.ts';
import { CommunicationKeyPair } from '../../models/CommunicationKeyPair/CommunicationKeyPair.ts';

let keyPair: CommunicationKeyPair;
let session: Session;

beforeEach(async () => {
  keyPair = await CommunicationKeyPair.create();
  session = await Session.create(keyPair.publicKey);
});

afterEach(async () => {
  await keyPair.destroy();
  await session.destroy();
});

test('sessionIdValidator should pass validation with valid session ID', async () => {
  // Use the actual session ID from the created session
  await expect(sessionIdValidator(session.id.data, session)).resolves.toBe(
    true,
  );
});

test('sessionIdValidator should fail validation with different session ID', async () => {
  const wrongSessionId = 'wrong-session-id';

  await expect(sessionIdValidator(wrongSessionId, session)).rejects.toThrow(
    'INVALID SESSION ID',
  );
});

test('sessionIdValidator should fail validation with undefined session ID', async () => {
  await expect(sessionIdValidator(undefined as any, session)).rejects.toThrow(
    'INVALID SESSION ID',
  );
});

test('sessionIdValidator should fail validation with empty session ID', async () => {
  await expect(sessionIdValidator('', session)).rejects.toThrow(
    'INVALID SESSION ID',
  );
});

test('sessionIdValidator should fail validation with corrupted session structure', async () => {
  const corruptedSession = {
    id: {
      data: undefined,
      iv: new Uint8Array([1, 2, 3, 4]),
    },
  } as any;

  await expect(sessionIdValidator('test-id', corruptedSession)).rejects.toThrow(
    'INVALID SESSION ID',
  );
});

test('sessionIdValidator should fail validation with missing iv', async () => {
  const corruptedSession = {
    id: {
      data: 'test-session-id',
      iv: undefined,
    },
  } as any;

  await expect(
    sessionIdValidator('test-session-id', corruptedSession),
  ).rejects.toThrow();
});

import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { PrepareForTradingReq } from '../types/PrepareForTradingReq.ts';

const validateSeedData = (seed: any): boolean => {
  if (seed === undefined) return true;
  return (
    seed &&
    seed.iv instanceof Uint8Array &&
    seed.salt instanceof Uint8Array &&
    seed.ciphertext instanceof Uint8Array
  );
};

const validateSessionData = (session: any): boolean => {
  if (session === undefined) return true;
  return (
    session &&
    session.iv instanceof Uint8Array &&
    session.ciphertext instanceof Uint8Array &&
    session.ephemeralPublicKey instanceof Uint8Array
  );
};

const validateDeviceKeys = (deviceKeys: any): boolean => {
  return (
    deviceKeys &&
    deviceKeys.publicKey instanceof Uint8Array &&
    (deviceKeys.privateKey === undefined ||
      deviceKeys.privateKey instanceof Uint8Array)
  );
};

export const prepareForTradingReqValidator =
  createValidator<PrepareForTradingReq>({
    type: 'safety-request',
    operation: 'PREPARE_FOR_TRADING',
    isSchemaInvalid: (payload) => {
      if (!payload) {
        return true;
      }

      if (!validateSeedData(payload.seed)) {
        return true;
      }

      if (!validateSessionData(payload.session)) {
        return true;
      }

      if (!validateDeviceKeys(payload.deviceKeys)) {
        return true;
      }

      return false;
    },
  });

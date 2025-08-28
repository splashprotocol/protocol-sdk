import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { PrepareForTradingReq } from '../types/PrepareForTradingReq.ts';
import {
  PFTReq_MasterPasswordPayload,
  PFTReq_NoSeedPayload,
  PrepareForTradingRequestPayload,
  PFTReq_TemporaryContainerPayload,
  PFTReq_TradingSessionPayload,
} from '../types/PrepareForTradingRequestPayload.ts';

const validateEncryptedContainer = (container: any): boolean => {
  return (
    container &&
    typeof container === 'object' &&
    container.ciphertext instanceof Uint8Array &&
    container.iv instanceof Uint8Array &&
    container.salt instanceof Uint8Array
  );
};

const isNoSeedPayloadValid = (payload: PFTReq_NoSeedPayload): boolean => {
  return payload.type === 'no-seed';
};

const isMasterPasswordPayloadValid = (
  payload: PFTReq_MasterPasswordPayload,
): boolean => {
  return (
    payload.type === 'master-password' &&
    payload.ciphertext instanceof Uint8Array &&
    payload.iv instanceof Uint8Array &&
    payload.salt instanceof Uint8Array
  );
};

const isTradingSessionPayloadValid = (
  payload: PFTReq_TradingSessionPayload,
): boolean => {
  if (payload.type !== 'session') {
    return false;
  }

  if (!validateEncryptedContainer(payload.masterPasswordContainer)) {
    return false;
  }

  if (!validateEncryptedContainer(payload.sessionContainer)) {
    return false;
  }

  if (payload.sessionPassword === 'sandbox') {
    return true;
  }

  return validateEncryptedContainer(payload.sessionPassword);
};

const isTemporaryContainerPayloadValid = (
  payload: PFTReq_TemporaryContainerPayload,
): boolean => {
  if (payload.type !== 'tmp-container') {
    return false;
  }

  if (!validateEncryptedContainer(payload.masterPasswordContainer)) {
    return false;
  }

  const tempContainer = payload.temporaryContainer;
  if (!tempContainer || typeof tempContainer !== 'object') {
    return false;
  }

  return (
    validateEncryptedContainer(tempContainer) &&
    typeof tempContainer.temporaryPassword === 'string'
  );
};

const isPrepareForTradingPayloadValid = (
  payload: PrepareForTradingRequestPayload,
): boolean => {
  if (!payload || typeof payload !== 'object' || !payload.type) {
    return false;
  }

  switch (payload.type) {
    case 'no-seed':
      return isNoSeedPayloadValid(payload);
    case 'master-password':
      return isMasterPasswordPayloadValid(payload);
    case 'session':
      return isTradingSessionPayloadValid(payload);
    case 'tmp-container':
      return isTemporaryContainerPayloadValid(payload);
    default:
      return false;
  }
};

export const prepareForTradingReqValidator =
  createValidator<PrepareForTradingReq>({
    type: 'safety-request',
    operation: 'PREPARE_FOR_TRADING',
    isSchemaInvalid: (requestPayload) => {
      if (!requestPayload) {
        return true;
      }

      // Validate that payload exists and is valid
      if (!requestPayload) {
        return true;
      }

      return !isPrepareForTradingPayloadValid(requestPayload);
    },
  });

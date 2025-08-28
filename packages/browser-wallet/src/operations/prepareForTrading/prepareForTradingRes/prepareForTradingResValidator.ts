import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { PrepareForTradingRes } from '../types/PrepareForTradingRes.ts';
import {
  PFTRes_ExistedSessionPayload,
  PFTRes_NewSessionPayload,
  PrepareForTradingResponsePayload,
} from '../types/PrepareForTradingResponsePayload.ts';

const validateEncryptedContainer = (container: any): boolean => {
  return (
    container &&
    typeof container === 'object' &&
    container.salt instanceof Uint8Array &&
    container.iv instanceof Uint8Array &&
    container.ciphertext instanceof Uint8Array
  );
};

const validateWalletInfo = (info: any): boolean => {
  return (
    info &&
    typeof info === 'object' &&
    typeof info.pk === 'string' &&
    typeof info.pkh === 'string' &&
    typeof info.skh === 'string'
  );
};

const validateNewSession = (payload: PFTRes_NewSessionPayload): boolean => {
  if (payload.type !== 'new-session') {
    return false;
  }

  if (!validateWalletInfo(payload.info)) {
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

const validateExistedSession = (
  payload: PFTRes_ExistedSessionPayload,
): boolean => {
  if (payload.type !== 'existed-session') {
    return false;
  }

  return validateWalletInfo(payload.info);
};

const validatePrepareForTradingResultPayload = (
  payload: PrepareForTradingResponsePayload,
): boolean => {
  if (!payload || typeof payload !== 'object' || !payload.type) {
    return false;
  }

  switch (payload.type) {
    case 'new-session':
      return validateNewSession(payload);
    case 'existed-session':
      return validateExistedSession(payload);
    default:
      return false;
  }
};

export const prepareForTradingResValidator =
  createValidator<PrepareForTradingRes>({
    type: 'safety-response',
    operation: 'PREPARE_FOR_TRADING',
    isSchemaInvalid: (result: PrepareForTradingResponsePayload) => {
      if (!result) {
        return true;
      }

      if (!result) {
        return true;
      }

      return !validatePrepareForTradingResultPayload(result);
    },
  });

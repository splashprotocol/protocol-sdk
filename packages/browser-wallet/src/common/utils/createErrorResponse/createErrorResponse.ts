import { ErrorResponse, ErrorTerminate } from '../../types/ErrorResponse.ts';
import { OperationType } from '../../types/OperationType.ts';
import { generateNonce } from '../generateNonce/generateNonce.ts';

export const createErrorResponse = <OT extends OperationType>(
  type: OT,
  message: string,
  deviceId: string,
  requestId: string,
  errorTerminate?: ErrorTerminate,
): ErrorResponse<OT> => {
  return {
    deviceId,
    type,
    message,
    terminate: errorTerminate,
    timestamp: Date.now(),
    requestId,
    nonce: generateNonce(),
    kind: 'error',
  };
};

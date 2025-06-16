import { ErrorResponse } from '../../types/ErrorResponse.ts';
import { OperationType } from '../../types/OperationType.ts';
import { generateRequestId } from '../generateRequestId/generateRequestId.ts';
import { generateNonce } from '../generateNonce/generateNonce.ts';

export const createErrorResponse = <OT extends OperationType>(
  type: OT,
  message: string,
  deviceId: string,
  sessionEnd?: boolean,
): ErrorResponse<OT> => {
  return {
    deviceId,
    type,
    message,
    sessionEnd: sessionEnd || false,
    timestamp: Date.now(),
    requestId: generateRequestId(),
    nonce: generateNonce(),
    kind: 'error',
  };
};

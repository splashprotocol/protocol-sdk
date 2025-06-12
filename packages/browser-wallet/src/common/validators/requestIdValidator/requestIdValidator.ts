import { validate } from 'uuid';

const requestIds = new Set<string>();
const ERROR_MESSAGE = 'INVALID REQUEST ID';

export const requestIdValidator = (requestId: string) => {
  if (!validate(requestId) || requestIds.has(requestId)) {
    throw new Error(ERROR_MESSAGE);
  }
  requestIds.add(requestId);

  return true;
};

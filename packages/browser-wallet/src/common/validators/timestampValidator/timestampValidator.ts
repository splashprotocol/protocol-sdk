const MAX_DELAY = 5_000;
const ERROR_MESSAGE = 'INVALID TIMESTAMP';

export const timestampValidator = (timestamp: number) => {
  const now = Date.now();
  if (now - timestamp > MAX_DELAY || now < timestamp) {
    throw new Error(ERROR_MESSAGE);
  }
  return true;
};

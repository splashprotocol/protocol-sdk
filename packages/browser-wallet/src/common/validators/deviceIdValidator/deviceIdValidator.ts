const ERROR_MESSAGE = 'INVALID DEVICE ID';
export const deviceIdValidator = (expected: string, current: string) => {
  if (expected !== current) {
    throw new Error(ERROR_MESSAGE);
  }
  return true;
};

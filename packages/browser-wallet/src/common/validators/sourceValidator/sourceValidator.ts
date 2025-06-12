const ERROR_MESSAGE = 'INVALID SOURCE';
export const sourceValidator = (
  expected: MessageEventSource | null,
  current: MessageEventSource | null,
) => {
  if (expected !== current) {
    throw new Error(ERROR_MESSAGE);
  }
  return true;
};

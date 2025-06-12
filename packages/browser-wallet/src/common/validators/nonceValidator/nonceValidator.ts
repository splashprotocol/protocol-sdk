const nonces = new Set<string>();

const ERROR_MESSAGE = 'INVALID NONCE';

export const nonceValidator = (nonce: string) => {
  if (nonces.has(nonce)) {
    throw new Error(ERROR_MESSAGE);
  }
  nonces.add(nonce);

  return true;
};

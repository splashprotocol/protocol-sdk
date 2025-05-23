export class UserDeclinedSignError extends Error {}

export const isUserDeclinedSignError = (err: any): boolean => {
  // eternl
  if (err?.message?.includes('user declined sign tx')) {
    return true;
  }
  // vespr
  if (
    err?.code === -3 &&
    err?.info ===
      'The request was refused due to lack of access - e.g. wallet disconnects.'
  ) {
    return true;
  }
  // begin
  if (err?.code === -3 && err?.info === 'Refused') {
    return true;
  }
  // lace
  if (err?.code === 2 && err?.info === 'user declined signing tx') {
    return true;
  }
  return false;
};

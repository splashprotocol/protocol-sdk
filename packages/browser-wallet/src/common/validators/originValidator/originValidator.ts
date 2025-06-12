const ERROR_MESSAGE = 'INVALID ORIGIN';
export const originValidator = (
  validOrigins: string[],
  origin: string,
): true => {
  if (!validOrigins.includes(origin)) {
    throw new Error(ERROR_MESSAGE);
  }
  return true;
};

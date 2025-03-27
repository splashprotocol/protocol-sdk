export const assertBytesLength = (
  bytes: Uint8Array | Buffer | Array<number>,
  expectedLength: number,
) => {
  if (bytes.length !== expectedLength) {
    throw new Error(
      `bytes should has size ${expectedLength}. Received: ${bytes.length}`,
    );
  }
};

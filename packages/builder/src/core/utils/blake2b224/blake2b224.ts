import { InferPromise } from '../../types/InferPromise.ts';

const blake2bP = import('hash-wasm').then((m) => m.blake2b);

export const blake2b224: InferPromise<typeof blake2bP> = async (
  data,
  bits = 224,
  key,
) => {
  const blake2b = await blake2bP;

  return blake2b(data, bits, key);
};

import { v4 } from 'uuid';

export const generateNonce = () => {
  return v4();
};

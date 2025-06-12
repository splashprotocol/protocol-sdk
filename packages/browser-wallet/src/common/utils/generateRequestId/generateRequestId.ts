import { v4 } from 'uuid';

export const generateRequestId = () => {
  return v4();
};

import { OperationType } from '../../types/OperationType.ts';

const operations: OperationType[] = [
  'START_SESSION',
  'READY',
  'SET_THEME',
  'PREPARE_FOR_TRADING',
  'SIGN_TRANSACTION',
  'SIGN_DATA',
  'GENERATE_DEVICE_KEY',
];
export const isWalletOperation = (data: any) => {
  if (data instanceof Object) {
    return operations.includes(data.type);
  }
  return false;
};

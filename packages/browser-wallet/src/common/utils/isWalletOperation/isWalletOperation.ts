import { OperationType } from '../../types/OperationType.ts';

const operations: OperationType[] = [
  'START_SESSION',
  'GET_STATUS',
  'READY',
  'ENTER_PIN_INTERNAL',
  'SET_THEME',
  'ENTER_PIN_EXTERNAL',
  'CREATE_OR_ADD_SEED',
  'REMOVE_SEED',
  'SIGN_TRANSACTION',
  'SIGN_DATA',
];
export const isWalletOperation = (data: any) => {
  if (data instanceof Object) {
    return operations.includes(data.type);
  }
  return false;
};

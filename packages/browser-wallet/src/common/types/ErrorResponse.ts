import { OperationType } from './OperationType.ts';

export type ErrorTerminate = 'session' | 'full';

export interface ErrorResponse<T extends OperationType> {
  readonly requestId: string;
  readonly type: T;
  readonly timestamp: number;
  readonly kind: 'error';
  readonly message: string;
  readonly deviceId: string;
  readonly nonce: string;
  readonly terminate?: ErrorTerminate;
}

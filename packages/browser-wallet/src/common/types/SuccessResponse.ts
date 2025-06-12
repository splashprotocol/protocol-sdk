import { OperationType } from './OperationType.ts';

export interface BaseSuccessResponse<T extends OperationType, P> {
  readonly requestId: string;
  readonly type: T;
  readonly timestamp: number;
  readonly payload: P;
  readonly kind: 'success';
  readonly deviceId: string;
  readonly nonce: string;
}

export interface SafetySuccessResponse<T extends OperationType, P>
  extends BaseSuccessResponse<T, P> {
  readonly sessionId: string;
  readonly signature: Uint8Array;
}

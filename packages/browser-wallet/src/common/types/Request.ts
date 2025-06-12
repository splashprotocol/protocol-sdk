import { OperationType } from './OperationType.ts';

export interface BaseRequest<T extends OperationType> {
  readonly requestId: string;
  readonly type: T;
  readonly timestamp: number;
  readonly deviceId: string;
  readonly nonce: string;
}

export interface NoSessionRequest<T extends OperationType, P>
  extends BaseRequest<T> {
  readonly payload: P;
  readonly signature: Uint8Array;
}

export interface SafetyRequest<T extends OperationType, P>
  extends NoSessionRequest<T, P> {
  readonly sessionId: string;
}

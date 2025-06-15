import { OperationType } from './OperationType.ts';

export interface BaseRequest<T extends OperationType, P> {
  readonly requestId: string;
  readonly type: T;
  readonly timestamp: number;
  readonly deviceId: string;
  readonly nonce: string;
  readonly payload: P;
}

export interface NoSessionRequest<T extends OperationType, P>
  extends BaseRequest<T, P> {
  readonly signature: Uint8Array;
}

export interface SafetyRequest<T extends OperationType, P>
  extends NoSessionRequest<T, P> {
  readonly sessionId: string;
}

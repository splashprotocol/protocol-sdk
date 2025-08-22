import {
  BaseSuccessResponse,
  NoSessionResponse,
  SafetySuccessResponse,
} from '../../types/SuccessResponse.ts';
import {
  BaseRequest,
  NoSessionRequest,
  SafetyRequest,
} from '../../types/Request.ts';
import { ErrorResponse } from '../../types/ErrorResponse.ts';
import { CommunicationPublicKey } from '../../models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { Session } from '../../models/Session/Session.ts';
import { nonceValidator } from '../../validators/nonceValidator/nonceValidator.ts';
import { originValidator } from '../../validators/originValidator/originValidator.ts';
import { timestampValidator } from '../../validators/timestampValidator/timestampValidator.ts';
import { sourceValidator } from '../../validators/sourceValidator/sourceValidator.ts';
import { deviceIdValidator } from '../../validators/deviceIdValidator/deviceIdValidator.ts';
import { noSessionRequestSchemaValidator } from '../../validators/noSessionRequestSchemaValidator/noSessionRequestSchemaValidator.ts';
import { baseSuccessMessageSchemaValidator } from '../../validators/baseSuccessMessageSchemaValidator/baseSuccessMessageSchemaValidator.ts';
import { safetyResponseSchemaValidator } from '../../validators/safetyResponseSchemaValidator/safetyResponseSchemaValidator.ts';
import { baseMessageSchemaValidator } from '../../validators/baseMessageSchemaValidator/baseMessageSchemaValidator.ts';
import { OperationType } from '../../types/OperationType.ts';
import { signatureValidator } from '../../validators/signatureValidator/signatureValidator.ts';
import { sessionIdValidator } from '../../validators/sessionIdValidator/sessionIdValidator.ts';
import { noSessionResponseSchemaValidator } from '../../validators/noSessionResponseSchemaValidator/noSessionResponseSchemaValidator.ts';
import { requestIdValidator } from '../../validators/requestIdValidator/requestIdValidator.ts';

type AnyCase<OT extends OperationType, P> =
  | NoSessionResponse<OT, P>
  | SafetySuccessResponse<OT, P>
  | NoSessionRequest<OT, P>
  | SafetyRequest<OT, P>
  | BaseRequest<OT, P>
  | BaseSuccessResponse<OT, P>;

export interface SafetyResponseValidatorFactoryParams<
  OT extends OperationType,
  P,
> {
  readonly type: 'safety-response';
  readonly operation: OT;
  readonly isSchemaInvalid: (payload: P) => boolean;
  readonly params?: {
    readonly event: MessageEvent<SafetySuccessResponse<OT, P>>;
    readonly deviceId: string;
    readonly validOrigins: string[];
    readonly expectedSource: MessageEventSource | null;
    readonly publicKey: CommunicationPublicKey;
  };
}

export interface NoSessionResponseValidatorFactoryParams<
  OT extends OperationType,
  P,
> {
  readonly type: 'no-session-response';
  readonly operation: OT;
  readonly isSchemaInvalid: (payload: P) => boolean;
  readonly getPublicKey: (
    payload: P,
  ) => CommunicationPublicKey | Uint8Array<any>;
  readonly params?: {
    readonly event: MessageEvent<NoSessionResponse<OT, P>>;
    readonly deviceId: string;
    readonly validOrigins: string[];
    readonly expectedSource: MessageEventSource | null;
  };
}

export interface BaseResponseValidatorFactoryParams<
  OT extends OperationType,
  P,
> {
  readonly type: 'base-response';
  readonly operation: OT;
  readonly isSchemaInvalid: (payload: P) => boolean;
  readonly params?: {
    readonly event: MessageEvent<BaseSuccessResponse<OT, P>>;
    readonly deviceId: string;
    readonly validOrigins: string[];
    readonly expectedSource: MessageEventSource | null;
  };
}

export interface SafetyRequestValidatorFactoryParams<
  OT extends OperationType,
  P,
> {
  readonly type: 'safety-request';
  readonly operation: OT;
  readonly isSchemaInvalid: (payload: P) => boolean;
  readonly params?: {
    readonly event: MessageEvent<SafetyRequest<OT, P>>;
    readonly deviceId: string;
    readonly validOrigins: string[];
    readonly expectedSource: MessageEventSource | null;
    readonly session: Session;
  };
}

export interface NoSessionRequestValidatorFactoryParams<
  OT extends OperationType,
  P,
> {
  readonly type: 'no-session-request';
  readonly operation: OT;
  readonly isSchemaInvalid: (payload: P) => boolean;
  readonly getPublicKey: (
    payload: P,
  ) => CommunicationPublicKey | Uint8Array<any>;
  readonly params?: {
    readonly event: MessageEvent<NoSessionRequest<OT, P>>;
    readonly deviceId: string;
    readonly validOrigins: string[];
    readonly expectedSource: MessageEventSource | null;
  };
}

export interface BaseRequestValidatorFactoryParams<
  OT extends OperationType,
  P,
> {
  readonly type: 'base-request';
  readonly operation: OT;
  readonly isSchemaInvalid: (payload: P) => boolean;
  readonly params?: {
    readonly event: MessageEvent<BaseRequest<OT, P>>;
    readonly deviceId: string;
    readonly validOrigins: string[];
    readonly expectedSource: MessageEventSource | null;
  };
}

export interface ErrorValidatorFactoryParams<OT extends OperationType> {
  readonly type: 'error';
  readonly operation: OT;
  readonly params?: {
    readonly event: MessageEvent<ErrorResponse<OT>>;
    readonly deviceId: string;
    readonly validOrigins: string[];
    readonly expectedSource: MessageEventSource | null;
  };
}

export type ValidatorFactoryParams<T extends AnyCase<any, any>> =
  T extends NoSessionResponse<infer OT, infer P>
    ? NoSessionResponseValidatorFactoryParams<OT, P>
    : T extends SafetySuccessResponse<infer OT, infer P>
      ? SafetyResponseValidatorFactoryParams<OT, P>
      : T extends BaseSuccessResponse<infer OT, infer P>
        ? BaseResponseValidatorFactoryParams<OT, P>
        : T extends SafetyRequest<infer OT, infer P>
          ? SafetyRequestValidatorFactoryParams<OT, P>
          : T extends NoSessionRequest<infer OT, infer P>
            ? NoSessionRequestValidatorFactoryParams<OT, P>
            : T extends BaseRequest<infer OT, infer P>
              ? BaseRequestValidatorFactoryParams<OT, P>
              : T extends ErrorResponse<infer OT>
                ? ErrorValidatorFactoryParams<OT>
                : never;

export const createValidator = <T extends AnyCase<any, any>>(
  factoryParams: ValidatorFactoryParams<T>,
) => {
  return async (
    params: Exclude<(typeof factoryParams)['params'], undefined>,
  ): Promise<true> => {
    // Generate proper error messages that match existing patterns
    const getErrorMessages = () => {
      const operation = factoryParams.operation
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');

      const typeStr = factoryParams.type.includes('request')
        ? 'REQUEST'
        : factoryParams.type.includes('response')
          ? 'SUCCESS RESPONSE'
          : 'RESPONSE';

      return {
        type: `INVALID ${operation.toUpperCase()} ${typeStr} TYPE`,
        schema: `INVALID ${operation.toUpperCase()} ${typeStr} SCHEMA`,
      };
    };

    const errors = getErrorMessages();

    if (params.event.data.type !== factoryParams.operation) {
      throw new Error(errors.type);
    }
    const errorMessage = errors.schema;
    //

    switch (factoryParams.type) {
      case 'safety-response':
        safetyResponseSchemaValidator(params.event.data as any, errorMessage);
        break;
      case 'no-session-response':
        noSessionResponseSchemaValidator(
          params.event.data as any,
          errorMessage,
        );
        break;
      case 'base-response':
        baseSuccessMessageSchemaValidator(
          params.event.data as any,
          errorMessage,
        );
        break;
      case 'base-request':
        baseMessageSchemaValidator(params.event.data as any, errorMessage);
        requestIdValidator(params.event.data.requestId);
        break;
      case 'no-session-request':
        noSessionRequestSchemaValidator(params.event.data as any, errorMessage);
        requestIdValidator(params.event.data.requestId);
        break;
      case 'safety-request':
        baseMessageSchemaValidator(params.event.data as any, errorMessage);
        requestIdValidator(params.event.data.requestId);
        break;
    }

    if (factoryParams.isSchemaInvalid(params.event.data.payload)) {
      throw new Error(errorMessage);
    }

    nonceValidator(params.event.data.nonce);
    timestampValidator(params.event.data.timestamp);
    originValidator(params.validOrigins, params.event.origin);
    sourceValidator(params.expectedSource, params.event.source);
    deviceIdValidator(params.event.data.deviceId, params.deviceId);

    switch (factoryParams.type) {
      case 'safety-request':
        const normalizedParamsSRQ = params as Exclude<
          typeof factoryParams.params,
          undefined
        >;
        await sessionIdValidator(
          normalizedParamsSRQ.event.data.sessionId,
          normalizedParamsSRQ.session,
        );
        await signatureValidator(
          normalizedParamsSRQ.session.anotherSidePublicKey,
          normalizedParamsSRQ.event.data,
          normalizedParamsSRQ.deviceId,
        );
        break;
      case 'no-session-request':
        const normalizedParamsNSRQ = params as Exclude<
          typeof factoryParams.params,
          undefined
        >;
        await signatureValidator(
          factoryParams.getPublicKey(normalizedParamsNSRQ.event.data.payload),
          normalizedParamsNSRQ.event.data,
          normalizedParamsNSRQ.deviceId,
        );
        break;
      case 'no-session-response':
        const normalizedParamsNSRS = params as Exclude<
          typeof factoryParams.params,
          undefined
        >;
        await signatureValidator(
          factoryParams.getPublicKey(normalizedParamsNSRS.event.data.payload),
          normalizedParamsNSRS.event.data,
          normalizedParamsNSRS.deviceId,
        );
        break;
      case 'safety-response':
        const normalizedParamsSRS = params as Exclude<
          typeof factoryParams.params,
          undefined
        >;
        await signatureValidator(
          normalizedParamsSRS.publicKey,
          normalizedParamsSRS.event.data,
          normalizedParamsSRS.deviceId,
        );
        break;
      default:
        break;
    }

    return true;
  };
};

// createValidator<SignTxReq>({
//   type: 'safety-request',
//   operation: 'SIGN_TRANSACTION',
//   isSchemaInvalid: () => true
// })({
//   event:
// })

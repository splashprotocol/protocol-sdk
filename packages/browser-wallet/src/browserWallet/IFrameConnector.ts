import { OperationType } from '../common/types/OperationType.ts';
import { Dictionary } from '@splashprotocol/core';
import { readySuccessResponseValidator } from '../operations/ready/readySuccessResponse/readySuccessResponseValidator.ts';
import {
  CommunicationKeyPair,
  CommunicationPublicKey,
} from '../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import {
  AnyErrorResponse,
  AnyRequest,
  AnySuccessResponse,
} from '../operations/AnyOperation.ts';
import { getDeviceId } from '../common/utils/getDeviceId/getDeviceId.ts';
import { createStartSessionRequest } from '../operations/startSession/startSessionRequest/createStartSessionRequest.ts';
import { startSessionSuccessResponseValidator } from '../operations/startSession/startSessionSuccessResponseValidator.ts';
import { createGetWalletStatusRequest } from '../operations/getWalletStatus/getWalletStatusRequest/createGetWalletStatusRequest.ts';
import { GetWalletStatusRequest } from '../operations/getWalletStatus/types/GetWalletStatusRequest.ts';
import { GetWalletStatusSuccessResponse } from '../operations/getWalletStatus/types/GetWalletStatusSuccessResponse.ts';

const IFRAME_ID = '__splash__wallet__';
let iFrame: HTMLIFrameElement | undefined;

interface IFrameOperation {
  readonly type: OperationType;
  readonly payload: any;
  readonly resolve: (value: any) => void;
  readonly reject: (reason: Error) => void;
}

interface IFrameBackupOperation {
  readonly type: OperationType;
  readonly payload: any;
  readonly resolve: (value: any) => void;
  readonly reject: (reason: Error) => void;
}

export interface IFrameConnectorResponse {
  destroy: () => void;
  getStatus: () => Promise<GetWalletStatusSuccessResponse>;
}

const MAX_RETRY_COUNT = 5;
export const IFrameConnector = (
  iframeUrl: string,
): Promise<IFrameConnectorResponse> => {
  let retryCount = 0;
  let backupOperations: IFrameBackupOperation[] = [];
  const currentOperations: Dictionary<IFrameOperation> = {};
  let status: 'loading' | 'ready' = 'loading';
  let iframePublicKey: CommunicationPublicKey = null as any;
  let communicationKeyPair: CommunicationKeyPair = null as any;
  let sessionId: string = null as any;
  console.log(iframePublicKey, communicationKeyPair, sessionId);
  const unregisteredIframe = document.getElementById(IFRAME_ID);
  if (unregisteredIframe && !iFrame) {
    throw new Error('fake iframe exists');
  }
  if (!iFrame) {
    iFrame = document.createElement('iframe');
    iFrame.id = IFRAME_ID;
    iFrame.src = iframeUrl;
  }

  const submit = <P extends AnyRequest, R extends AnySuccessResponse>(
    request: P,
  ): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (status === 'loading') {
        backupOperations = backupOperations.concat({
          payload: request.payload,
          type: request.type,
          reject,
          resolve,
        });
      } else {
        currentOperations[request.requestId] = {
          reject,
          resolve,
          type: request.type,
          payload: request.payload,
        };
        iFrame!.contentWindow!.postMessage(request, iframeUrl);
      }
    });
  };

  const applyBackup = (deviceId: string) => {
    const waitings = backupOperations.map((operation) => {
      switch (operation.type) {
        case 'GET_STATUS':
          return submit(createGetWalletStatusRequest(deviceId));
        default:
          return Promise.resolve();
      }
    });
    backupOperations = [];

    return Promise.all(waitings);
  };

  const result = new Promise<IFrameConnectorResponse>((resolve, reject) => {
    const messageHandler = async (
      event: MessageEvent<AnySuccessResponse | AnyErrorResponse>,
    ) => {
      const deviceId = await getDeviceId();

      if (!(event?.data instanceof Object)) {
        return;
      }

      switch (event.data.type) {
        case 'READY':
          console.log('ready', event.data);
          readySuccessResponseValidator(event as any, deviceId, [iframeUrl]);
          const newKeyPair = await CommunicationKeyPair.create();
          const sessionRequest = await createStartSessionRequest(
            deviceId,
            newKeyPair,
          );
          communicationKeyPair = newKeyPair;
          iFrame!.contentWindow!.postMessage(sessionRequest, iframeUrl);
          return;
        case 'START_SESSION':
          console.log('session start', event.data);
          if (event.data.kind === 'success') {
            startSessionSuccessResponseValidator(event as any, deviceId, [
              iframeUrl,
            ]);
            retryCount = 0;
            status = 'ready';
            sessionId = event.data.sessionId;
            iframePublicKey = await CommunicationPublicKey.fromBytes(
              event.data.payload,
            );
            applyBackup(deviceId);
            resolve({
              destroy() {
                window.removeEventListener('message', messageHandler);
              },
              getStatus() {
                return submit<
                  GetWalletStatusRequest,
                  GetWalletStatusSuccessResponse
                >(createGetWalletStatusRequest(deviceId));
              },
            } as IFrameConnectorResponse);
          }
          // need error validator
          if (retryCount >= MAX_RETRY_COUNT) {
            reject(new Error('open session failed'));
          }
          retryCount++;
          iFrame!.contentWindow?.location.reload();
          return;
      }
    };
    window.addEventListener('message', messageHandler);
  });
  console.log(iFrame, iframeUrl);
  window.document.body.appendChild(iFrame!);
  return result;
};

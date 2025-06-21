import { CborHexString, Dictionary } from '@splashprotocol/core';
import { readyResValidator } from '../operations/ready/readySuccessResponse/readyResValidator.ts';
import {
  CommunicationKeyPair,
  CommunicationPublicKey,
} from '../common/models/CommunicationKeyPair/CommunicationKeyPair.ts';
import { AnyErr, AnyReq, AnyRes } from '../operations/AnyOperation.ts';
import { getDeviceId } from '../common/utils/getDeviceId/getDeviceId.ts';
import { createStartSessionReq } from '../operations/startSession/startSessionReq/createStartSessionReq.ts';
import { createGetWalletStatusReq } from '../operations/getWalletStatus/getWalletStatusReq/createGetWalletStatusReq.ts';
import { GetWalletStatusRes } from '../operations/getWalletStatus/types/GetWalletStatusRes.ts';
import { isWalletOperation } from '../common/utils/isWalletOperation/isWalletOperation.ts';
import {
  AnomalyAnalyzer,
  AnomalyError,
} from '../common/models/AnomalyAnalyzer/AnomalyAnalyzer.ts';
import { ErrorTerminate } from '../common/types/ErrorResponse.ts';

import { startSessionResValidator } from '../operations/startSession/startSessionRes/startSessionResValidator.ts';
import { StartSessionRes } from '../operations/startSession/types/StartSessionRes.ts';
import { errorResponseValidator } from '../common/validators/errorResponseValidator/errorResponseValidator.ts';
import { ReadyRes } from '../operations/ready/types/ReadyRes.ts';
import { WalletStatus } from '../operations/getWalletStatus/types/WalletStatus.ts';
import { getWalletStatusResValidator } from '../operations/getWalletStatus/getWalletStatusRes/getWalletStatusResValidator.ts';
import { OperationType } from '../common/types/OperationType.ts';
import { generateRequestId } from '../common/utils/generateRequestId/generateRequestId.ts';
import { createSetSeedPhraseReq } from '../operations/setSeedPhrase/setSeedPhraseReq/createSetSeedPhraseReq.ts';
import { SetSeedPhraseRes } from '../operations/setSeedPhrase/types/setSeedPhraseRes.ts';
import { setSeedPhraseResValidator } from '../operations/setSeedPhrase/setSeedPhraseRes/setSeedPhraseResValidator.ts';
import { EnterPinSuccessRes } from '../operations/enterPin/types/EnterPinSuccessRes.ts';
import { createEnterPinReq } from '../operations/enterPin/enterPinReq/createEnterPinReq.ts';
import { enterPinResValidator } from '../operations/enterPin/enterPinRes/enterPinResValidator.ts';
import { PinStatus } from '../operations/enterPin/types/PinStatus.ts';
import { WalletInfo } from '../operations/getWalletInfo/type/WalletInfo.ts';
import { GetWalletInfoRes } from '../operations/getWalletInfo/type/GetWalletInfoRes.ts';
import { createGetWalletInfoReq } from '../operations/getWalletInfo/getWalletInfoReq/createGetWalletInfoReq.ts';
import { getWalletInfoResValidator } from '../operations/getWalletInfo/getWalletInfoRes/getWalletInfoResValidator.ts';
import { DataSignature } from '../operations/signData/types/DataSignature.ts';
import { SignDataRes } from '../operations/signData/types/SignDataRes.ts';
import { createSignDataReq } from '../operations/signData/signDataReq/createSignDataReq.ts';
import { signDataResValidator } from '../operations/signData/signDataRes/signDataResValidator.ts';
import { SignTxRes } from '../operations/signTx/types/SignTxRes.ts';
import { createSignTxReq } from '../operations/signTx/signTxReq/createSignTxReq.ts';
import { signTxResValidator } from '../operations/signTx/signTxRes/signTxResValidator.ts';
import { SetThemeRes } from '../operations/setTheme/types/SetThemeRes.ts';
import { createSetThemeReq } from '../operations/setTheme/setThemeReq/createSetThemeReq.ts';
import { setThemeResValidator } from '../operations/setTheme/setThemeRes/setThemeResValidator.ts';
import { Theme } from '../operations/setTheme/types/Theme.ts';
import { RemoveSeedPhraseRes } from '../operations/removeSeedPhrase/types/RemoveSeedPhraseRes.ts';
import { createRemoveSeedPhraseReq } from '../operations/removeSeedPhrase/removeSeedPhraseReq/createRemoveSeedPhraseReq.ts';
import { removeSeddPhraseResValidator } from '../operations/removeSeedPhrase/removeSeedPhraseRes/removeSeedPhraseResValidator.ts';

interface IFrameOperation {
  readonly requestId: string;
  readonly operationType: OperationType;
  readonly request: (requestId: string) => Promise<AnyReq>;
  readonly resolve: (value: any) => void;
  readonly reject: (reason: Error) => void;
  readonly validator: (
    response: MessageEvent<AnyRes>,
    deviceId: string,
  ) => Promise<true>;
}

export interface IFrameConnectorResponse {
  destroy(): void;
  setTheme(theme: Theme): Promise<void>;
  getStatus(): Promise<WalletStatus>;
  addOrGenerateSeed(): Promise<WalletStatus>;
  enterPin(): Promise<PinStatus>;
  getWalletInfo(): Promise<WalletInfo>;
  signData(payload: Uint8Array): Promise<DataSignature>;
  signTx(TxCbor: CborHexString): Promise<CborHexString>;
  removeSeedPhrase(): Promise<WalletStatus>;
}

const IFRAME_ID = '__splash__wallet__';
let connectionResponse: IFrameConnectorResponse = null as any;

export const IFrameConnector = (iframeUrl: string): IFrameConnectorResponse => {
  if (connectionResponse) {
    return connectionResponse;
  }
  let futureOperations: Dictionary<IFrameOperation> = {};
  let currentOperations: Dictionary<IFrameOperation> = {};
  let initialized: boolean = false;
  let iframePublicKey: CommunicationPublicKey = null as any;
  let communicationKeyPair: CommunicationKeyPair = null as any;
  let sessionId: string = null as any;
  let anomalyAnalyzer = AnomalyAnalyzer.create({
    maxRps: 30,
    maxErrorCount: 10,
  });

  const unregisteredIframe = document.getElementById(IFRAME_ID);
  let iFrame: HTMLIFrameElement = null as any;
  if (unregisteredIframe && !iFrame) {
    throw new Error('fake iframe exists');
  }
  if (!iFrame) {
    iFrame = document.createElement('iframe');
    iFrame.id = IFRAME_ID;
    iFrame.src = iframeUrl;
    iFrame.style.height = '100vh';
    iFrame.style.width = '100vw';
    iFrame.style.position = 'fixed';
    iFrame.style.left = '0';
    iFrame.style.top = '0';
    iFrame.style.pointerEvents = 'none';
    iFrame.style.zIndex = '1000';
    iFrame.style.border = 'none';
    iFrame.style.outline = 'none';
    iFrame.style.display = 'none';
  }

  const showIframe = () => {
    iFrame.style.display = 'initial';
    iFrame.style.pointerEvents = 'initial';
  };

  const hideIframe = () => {
    iFrame.style.pointerEvents = 'none';
    iFrame.style.display = 'none';
  };

  const registerRequest = async ({
    request,
    requestId,
    reject,
    validator,
    resolve,
    operationType,
  }: IFrameOperation): Promise<void> => {
    if (operationType === 'START_SESSION' || initialized) {
      currentOperations[requestId] = {
        requestId,
        operationType,
        request,
        resolve,
        reject,
        validator,
      };
      iFrame!.contentWindow!.postMessage(await request(requestId), iframeUrl);
    } else {
      futureOperations[requestId] = {
        requestId,
        operationType,
        request,
        resolve,
        reject,
        validator,
      };
    }
  };

  const startSession = async () => {
    const response = await new Promise<StartSessionRes>(
      async (resolve, reject) => {
        communicationKeyPair = await CommunicationKeyPair.create();
        const requestId = generateRequestId();
        registerRequest({
          resolve,
          reject,
          requestId,
          operationType: 'START_SESSION',
          request: async (requestId) =>
            createStartSessionReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
            }),
          validator: (event, deviceId) => {
            return startSessionResValidator({
              event: event as unknown as MessageEvent<StartSessionRes>,
              deviceId,
              expectedSource: iFrame!.contentWindow!,
              validOrigins: [iframeUrl],
            });
          },
        });
      },
    );
    sessionId = response.sessionId;
    iframePublicKey = await CommunicationPublicKey.fromBytes(response.payload);
    currentOperations = futureOperations;
    initialized = true;
    Object.values(futureOperations).forEach(async ({ request, requestId }) =>
      iFrame!.contentWindow!.postMessage(await request(requestId), iframeUrl),
    );
    console.log('new session', sessionId);
    futureOperations = {};
  };

  const clearSession = async () => {
    sessionId = null as any;
    await iframePublicKey?.destroy();
    iframePublicKey = null as any;
    await communicationKeyPair?.destroy();
    communicationKeyPair = null as any;
    initialized = false;
  };

  const handleError = async (
    requestId: string,
    error: unknown,
    terminate?: ErrorTerminate,
  ) => {
    if (error instanceof AnomalyError || !!terminate) {
      futureOperations = currentOperations;
      currentOperations = {};
      await clearSession();
      if (error instanceof AnomalyError) {
        anomalyAnalyzer = AnomalyAnalyzer.create({
          maxRps: 30,
          maxErrorCount: 10,
        });
        iFrame!.contentWindow!.location.reload();
      } else if (terminate === 'session') {
        await startSession();
      }

      return;
    }
    if (requestId && currentOperations[requestId]) {
      currentOperations[requestId].reject(error as Error);
      delete currentOperations[requestId];
    }
  };

  const messageHandler = async (event: MessageEvent<AnyRes | AnyErr>) => {
    if (!isWalletOperation(event.data)) {
      return;
    }
    const deviceId = await getDeviceId();

    if (event.data.kind === 'error') {
      try {
        await anomalyAnalyzer.applyToValidator(() =>
          errorResponseValidator({
            event: event as unknown as MessageEvent<AnyErr>,
            deviceId,
            expectedSource: iFrame!.contentWindow!,
            validOrigins: [iframeUrl],
          }),
        );
      } catch (error: unknown) {
        await handleError(event.data.requestId, error);
        return;
      }
      await handleError(
        event.data.requestId,
        new Error(event.data.message),
        event.data.terminate,
      );
      return;
    }
    console.log(event.data);
    if (event.data.type === 'READY') {
      try {
        await readyResValidator({
          event: event as unknown as MessageEvent<ReadyRes>,
          deviceId,
          expectedSource: iFrame!.contentWindow,
          validOrigins: [iframeUrl],
        });
        startSession();
      } catch (error: unknown) {
        await handleError(
          event.data.requestId,
          new AnomalyError('something with ready'),
        );
      }
      return;
    }
    if (!currentOperations[event.data.requestId]) {
      return;
    }

    try {
      console.log(event.data, 'here 1');
      await anomalyAnalyzer.applyToValidator(() =>
        currentOperations[event.data.requestId].validator(
          event as MessageEvent<AnyRes>,
          deviceId,
        ),
      );
      console.log(event.data, 'here 2');
      currentOperations[event.data.requestId].resolve(event.data);
    } catch (error: unknown) {
      console.log(error);
      await handleError(event.data.requestId, error);
    }
  };

  window.addEventListener('message', messageHandler);

  window.document.body.appendChild(iFrame!);
  return {
    async destroy() {
      await clearSession();
      window.removeEventListener('message', messageHandler);
    },
    async removeSeedPhrase(): Promise<WalletStatus> {
      return new Promise<RemoveSeedPhraseRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) =>
            createRemoveSeedPhraseReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
              sessionId,
            }),
          resolve,
          reject,
          operationType: 'REMOVE_SEED',
          requestId,
          validator: (event, deviceId) =>
            removeSeddPhraseResValidator({
              event: event as unknown as MessageEvent<RemoveSeedPhraseRes>,
              deviceId,
              validOrigins: [iframeUrl],
              expectedSource: iFrame!.contentWindow!,
              publicKey: iframePublicKey,
            }),
        });
      }).then((data) => data.payload);
    },
    async setTheme(theme: Theme): Promise<void> {
      return new Promise<SetThemeRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) =>
            createSetThemeReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
              sessionId,
              payload: theme,
            }),
          resolve,
          reject,
          operationType: 'SET_THEME',
          requestId,
          validator: (event, deviceId) =>
            setThemeResValidator({
              event: event as unknown as MessageEvent<SetThemeRes>,
              deviceId,
              validOrigins: [iframeUrl],
              expectedSource: iFrame!.contentWindow!,
              publicKey: iframePublicKey,
            }),
        });
      }).then(() => {});
    },
    async getStatus(): Promise<WalletStatus> {
      return new Promise<GetWalletStatusRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) =>
            createGetWalletStatusReq({
              requestId,
              deviceId: await getDeviceId(),
            }),
          resolve,
          reject,
          operationType: 'GET_STATUS',
          requestId,
          validator: (event, deviceId) =>
            getWalletStatusResValidator({
              event: event as unknown as MessageEvent<GetWalletStatusRes>,
              deviceId,
              expectedSource: iFrame!.contentWindow!,
              validOrigins: [iframeUrl],
            }),
        });
      }).then((data) => data.payload);
    },
    async enterPin(): Promise<PinStatus> {
      return new Promise<EnterPinSuccessRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) => {
            showIframe();
            return createEnterPinReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
              sessionId,
            });
          },
          resolve,
          reject,
          requestId,
          operationType: 'ENTER_PIN',
          validator: (event, deviceId) =>
            enterPinResValidator({
              event: event as unknown as MessageEvent<EnterPinSuccessRes>,
              deviceId,
              validOrigins: [iframeUrl],
              expectedSource: iFrame!.contentWindow!,
              publicKey: iframePublicKey,
            }),
        });
      })
        .then((data) => {
          hideIframe();
          return data.payload;
        })
        .catch((err) => {
          hideIframe();
          throw err;
        });
    },
    async getWalletInfo(): Promise<WalletInfo> {
      return new Promise<GetWalletInfoRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) => {
            return createGetWalletInfoReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
              sessionId,
            });
          },
          resolve,
          reject,
          requestId,
          operationType: 'GET_WALLET_INFO',
          validator: (event, deviceId) =>
            getWalletInfoResValidator({
              event: event as unknown as MessageEvent<GetWalletInfoRes>,
              deviceId,
              validOrigins: [iframeUrl],
              expectedSource: iFrame!.contentWindow!,
              publicKey: iframePublicKey,
            }),
        });
      }).then((res) => res.payload);
    },
    async signData(payload: Uint8Array): Promise<DataSignature> {
      return new Promise<SignDataRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) => {
            return createSignDataReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
              sessionId,
              payload,
            });
          },
          resolve,
          reject,
          requestId,
          operationType: 'SIGN_DATA',
          validator: (event, deviceId) =>
            signDataResValidator({
              event: event as unknown as MessageEvent<SignDataRes>,
              deviceId,
              validOrigins: [iframeUrl],
              expectedSource: iFrame!.contentWindow!,
              publicKey: iframePublicKey,
            }),
        });
      }).then((res) => res.payload);
    },
    async signTx(payload: CborHexString): Promise<CborHexString> {
      return new Promise<SignTxRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) => {
            return createSignTxReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
              sessionId,
              payload,
            });
          },
          resolve,
          reject,
          requestId,
          operationType: 'SIGN_TRANSACTION',
          validator: (event, deviceId) =>
            signTxResValidator({
              event: event as unknown as MessageEvent<SignTxRes>,
              deviceId,
              validOrigins: [iframeUrl],
              expectedSource: iFrame!.contentWindow!,
              publicKey: iframePublicKey,
            }),
        });
      }).then((res) => res.payload);
    },
    async addOrGenerateSeed(): Promise<WalletStatus> {
      return new Promise<SetSeedPhraseRes>(async (resolve, reject) => {
        const requestId = generateRequestId();
        registerRequest({
          request: async (requestId) => {
            showIframe();
            return createSetSeedPhraseReq({
              requestId,
              deviceId: await getDeviceId(),
              keyPair: communicationKeyPair,
              sessionId,
            });
          },
          resolve,
          reject,
          requestId,
          operationType: 'CREATE_OR_ADD_SEED',
          validator: (event, deviceId) =>
            setSeedPhraseResValidator({
              event: event as unknown as MessageEvent<SetSeedPhraseRes>,
              deviceId,
              validOrigins: [iframeUrl],
              expectedSource: iFrame!.contentWindow!,
              publicKey: iframePublicKey,
            }),
        });
      })
        .then((data) => {
          hideIframe();
          return data.payload;
        })
        .catch((err) => {
          hideIframe();
          throw err;
        });
    },
  };
};

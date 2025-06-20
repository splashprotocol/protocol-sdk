import { GetWalletStatusRequest } from './getWalletStatus/types/GetWalletStatusRequest.ts';
import { StartSessionRequest } from './startSession/types/StartSessionRequest.ts';
import { GetWalletStatusSuccessResponse } from './getWalletStatus/types/GetWalletStatusSuccessResponse.ts';
import { StartSessionSuccessResponse } from './startSession/types/StartSessionSuccessResponse.ts';
import { ReadyRes } from './ready/types/ReadyRes.ts';
import { GetWalletStatusErrorResponse } from './getWalletStatus/types/GetWalletStatusErrorResponse.ts';
import { StartSessionErrorResponse } from './startSession/types/StartSessionErrorResponse.ts';
import { CreateOrAddSeedPhraseSuccessResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseSuccessResponse.ts';
import { CreateOrAddSeedPhraseRequest } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseRequest.ts';
import { CreateOrAddSeedPhraseErrorResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseErrorResponse.ts';
import { EnterPinSuccessResponse } from './enterPin/types/EnterPinSuccessResponse.ts';
import { EnterPinRequest } from './enterPin/types/EnterPinRequest.ts';
import { EnterPinErrorResponse } from './enterPin/types/EnterPinErrorResponse.ts';

export type AnySuccessResponse =
  | GetWalletStatusSuccessResponse
  | StartSessionSuccessResponse
  | ReadyRes
  | CreateOrAddSeedPhraseSuccessResponse
  | EnterPinSuccessResponse;

export type AnyRequest =
  | GetWalletStatusRequest
  | StartSessionRequest
  | CreateOrAddSeedPhraseRequest
  | EnterPinRequest;

export type AnyErrorResponse =
  | GetWalletStatusErrorResponse
  | StartSessionErrorResponse
  | CreateOrAddSeedPhraseErrorResponse
  | EnterPinErrorResponse;

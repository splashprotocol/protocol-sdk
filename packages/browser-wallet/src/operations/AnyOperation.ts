import { GetWalletStatusRequest } from './getWalletStatus/types/GetWalletStatusRequest.ts';
import { StartSessionRequest } from './startSession/types/StartSessionRequest.ts';
import { GetWalletStatusSuccessResponse } from './getWalletStatus/types/GetWalletStatusSuccessResponse.ts';
import { StartSessionSuccessResponse } from './startSession/types/StartSessionSuccessResponse.ts';
import { ReadyResponse } from './ready/types/ReadyResponse.ts';
import { GetWalletStatusErrorResponse } from './getWalletStatus/types/GetWalletStatusErrorResponse.ts';
import { StartSessionErrorResponse } from './startSession/types/StartSessionErrorResponse.ts';
import { CreateOrAddSeedPhraseSuccessResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseSuccessResponse.ts';
import { CreateOrAddSeedPhraseRequest } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseRequest.ts';
import { CreateOrAddSeedPhraseErrorResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseErrorResponse.ts';

export type AnySuccessResponse =
  | GetWalletStatusSuccessResponse
  | StartSessionSuccessResponse
  | ReadyResponse
  | CreateOrAddSeedPhraseSuccessResponse;

export type AnyRequest =
  | GetWalletStatusRequest
  | StartSessionRequest
  | CreateOrAddSeedPhraseRequest;

export type AnyErrorResponse =
  | GetWalletStatusErrorResponse
  | StartSessionErrorResponse
  | CreateOrAddSeedPhraseErrorResponse;

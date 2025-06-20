import { GetWalletStatusRequest } from './getWalletStatus/types/GetWalletStatusRequest.ts';
import { StartSessionReq } from './startSession/types/StartSessionReq.ts';
import { GetWalletStatusSuccessResponse } from './getWalletStatus/types/GetWalletStatusSuccessResponse.ts';
import { StartSessionRes } from './startSession/types/StartSessionRes.ts';
import { ReadyRes } from './ready/types/ReadyRes.ts';
import { GetWalletStatusErrorResponse } from './getWalletStatus/types/GetWalletStatusErrorResponse.ts';
import { StartSessionErr } from './startSession/types/StartSessionErr.ts';
import { CreateOrAddSeedPhraseSuccessResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseSuccessResponse.ts';
import { CreateOrAddSeedPhraseRequest } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseRequest.ts';
import { CreateOrAddSeedPhraseErrorResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseErrorResponse.ts';
import { EnterPinSuccessResponse } from './enterPin/types/EnterPinSuccessResponse.ts';
import { EnterPinRequest } from './enterPin/types/EnterPinRequest.ts';
import { EnterPinErrorResponse } from './enterPin/types/EnterPinErrorResponse.ts';

export type AnyRes =
  | GetWalletStatusSuccessResponse
  | StartSessionRes
  | ReadyRes
  | CreateOrAddSeedPhraseSuccessResponse
  | EnterPinSuccessResponse;

export type AnyReq =
  | GetWalletStatusRequest
  | StartSessionReq
  | CreateOrAddSeedPhraseRequest
  | EnterPinRequest;

export type AnyErr =
  | GetWalletStatusErrorResponse
  | StartSessionErr
  | CreateOrAddSeedPhraseErrorResponse
  | EnterPinErrorResponse;

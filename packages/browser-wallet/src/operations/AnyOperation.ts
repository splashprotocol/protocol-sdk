import { GetWalletStatusReq } from './getWalletStatus/types/GetWalletStatusReq.ts';
import { StartSessionReq } from './startSession/types/StartSessionReq.ts';
import { GetWalletStatusRes } from './getWalletStatus/types/GetWalletStatusRes.ts';
import { StartSessionRes } from './startSession/types/StartSessionRes.ts';
import { ReadyRes } from './ready/types/ReadyRes.ts';
import { GetWalletStatusErr } from './getWalletStatus/types/GetWalletStatusErr.ts';
import { StartSessionErr } from './startSession/types/StartSessionErr.ts';
import { CreateOrAddSeedPhraseSuccessResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseSuccessResponse.ts';
import { CreateOrAddSeedPhraseRequest } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseRequest.ts';
import { CreateOrAddSeedPhraseErrorResponse } from './createOrAddSeedPhrase/types/CreateOrAddSeedPhraseErrorResponse.ts';
import { EnterPinSuccessResponse } from './enterPin/types/EnterPinSuccessResponse.ts';
import { EnterPinRequest } from './enterPin/types/EnterPinRequest.ts';
import { EnterPinErrorResponse } from './enterPin/types/EnterPinErrorResponse.ts';

export type AnyRes =
  | GetWalletStatusRes
  | StartSessionRes
  | ReadyRes
  | CreateOrAddSeedPhraseSuccessResponse
  | EnterPinSuccessResponse;

export type AnyReq =
  | GetWalletStatusReq
  | StartSessionReq
  | CreateOrAddSeedPhraseRequest
  | EnterPinRequest;

export type AnyErr =
  | GetWalletStatusErr
  | StartSessionErr
  | CreateOrAddSeedPhraseErrorResponse
  | EnterPinErrorResponse;

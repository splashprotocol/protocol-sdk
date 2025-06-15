import { GetWalletStatusRequest } from './getWalletStatus/types/GetWalletStatusRequest.ts';
import { StartSessionRequest } from './startSession/types/StartSessionRequest.ts';
import { GetWalletStatusSuccessResponse } from './getWalletStatus/types/GetWalletStatusSuccessResponse.ts';
import { StartSessionSuccessResponse } from './startSession/types/StartSessionSuccessResponse.ts';
import { ReadyResponse } from './ready/types/ReadyResponse.ts';
import { GetWalletStatusErrorResponse } from './getWalletStatus/types/GetWalletStatusErrorResponse.ts';

export type AnyRequest = GetWalletStatusRequest | StartSessionRequest;

export type AnySuccessResponse =
  | GetWalletStatusSuccessResponse
  | StartSessionSuccessResponse
  | ReadyResponse;

export type AnyErrorResponse = GetWalletStatusErrorResponse;

import { GetWalletStatusReq } from './getWalletStatus/types/GetWalletStatusReq.ts';
import { StartSessionReq } from './startSession/types/StartSessionReq.ts';
import { GetWalletStatusRes } from './getWalletStatus/types/GetWalletStatusRes.ts';
import { StartSessionRes } from './startSession/types/StartSessionRes.ts';
import { ReadyRes } from './ready/types/ReadyRes.ts';
import { GetWalletStatusErr } from './getWalletStatus/types/GetWalletStatusErr.ts';
import { StartSessionErr } from './startSession/types/StartSessionErr.ts';

import { EnterPinSuccessRes } from './enterPin/types/EnterPinSuccessRes.ts';
import { EnterPinReq } from './enterPin/types/EnterPinReq.ts';
import { EnterPinErr } from './enterPin/types/EnterPinErr.ts';
import { SetSeedPhraseRes } from './setSeedPhrase/types/setSeedPhraseRes.ts';
import { SetSeedPhraseReq } from './setSeedPhrase/types/setSeedPhraseReq.ts';
import { SetSeedPhraseErr } from './setSeedPhrase/types/SetSeedPhraseErr.ts';

export type AnyRes =
  | GetWalletStatusRes
  | StartSessionRes
  | ReadyRes
  | SetSeedPhraseRes
  | EnterPinSuccessRes;

export type AnyReq =
  | GetWalletStatusReq
  | StartSessionReq
  | SetSeedPhraseReq
  | EnterPinReq;

export type AnyErr =
  | GetWalletStatusErr
  | StartSessionErr
  | SetSeedPhraseErr
  | EnterPinErr;

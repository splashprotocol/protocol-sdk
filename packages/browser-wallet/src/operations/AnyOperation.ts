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
import { GetWalletInfoErr } from './getWalletInfo/type/GetWalletInfoErr.ts';
import { GetWalletInfoReq } from './getWalletInfo/type/GetWalletInfoReq.ts';
import { GetWalletInfoRes } from './getWalletInfo/type/GetWalletInfoRes.ts';
import { SignDataRes } from './signData/types/SignDataRes.ts';
import { SignDataReq } from './signData/types/SignDataReq.ts';
import { SignDataErr } from './signData/types/SignDataErr.ts';
import { SignTxRes } from './signTx/types/SignTxRes.ts';
import { SignTxReq } from './signTx/types/SignTxReq.ts';
import { SignTxErr } from './signTx/types/SignTxErr.ts';
import { SetThemeRes } from './setTheme/types/SetThemeRes.ts';
import { SetThemeReq } from './setTheme/types/SetThemeReq.ts';
import { SetThemeErr } from './setTheme/types/SetThemeErr.ts';

export type AnyRes =
  | GetWalletStatusRes
  | StartSessionRes
  | ReadyRes
  | SetSeedPhraseRes
  | EnterPinSuccessRes
  | GetWalletInfoRes
  | SignDataRes
  | SignTxRes
  | SetThemeRes;

export type AnyReq =
  | GetWalletStatusReq
  | StartSessionReq
  | SetSeedPhraseReq
  | EnterPinReq
  | GetWalletInfoReq
  | SignDataReq
  | SignTxReq
  | SetThemeReq;

export type AnyErr =
  | GetWalletStatusErr
  | StartSessionErr
  | SetSeedPhraseErr
  | EnterPinErr
  | GetWalletInfoErr
  | SignDataErr
  | SignTxErr
  | SetThemeErr;

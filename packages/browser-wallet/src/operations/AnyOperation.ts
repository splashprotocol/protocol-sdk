import { StartSessionReq } from './startSession/types/StartSessionReq.ts';
import { StartSessionRes } from './startSession/types/StartSessionRes.ts';
import { ReadyRes } from './ready/types/ReadyRes.ts';
import { StartSessionErr } from './startSession/types/StartSessionErr.ts';
import { PrepareForTradingRes } from './prepareForTrading/types/PrepareForTradingRes.ts';
import { PrepareForTradingReq } from './prepareForTrading/types/PrepareForTradingReq.ts';
import { PrepareForTradingErr } from './prepareForTrading/types/PrepareForTradingErr.ts';

import { SignDataRes } from './signData/types/SignDataRes.ts';
import { SignDataReq } from './signData/types/SignDataReq.ts';
import { SignDataErr } from './signData/types/SignDataErr.ts';
import { SignTxRes } from './signTx/types/SignTxRes.ts';
import { SignTxReq } from './signTx/types/SignTxReq.ts';
import { SignTxErr } from './signTx/types/SignTxErr.ts';
import { SetThemeRes } from './setTheme/types/SetThemeRes.ts';
import { SetThemeReq } from './setTheme/types/SetThemeReq.ts';
import { SetThemeErr } from './setTheme/types/SetThemeErr.ts';

import { GenerateDeviceKeyRes } from './generateDeviceKey/types/GenerateDeviceKeyRes.ts';
import { GenerateDeviceKeyReq } from './generateDeviceKey/types/GenerateDeviceKeyReq.ts';
import { GenerateDeviceKeyErr } from './generateDeviceKey/types/GenerateDeviceKeyErr.ts';

export type AnyRes =
  | StartSessionRes
  | ReadyRes
  | PrepareForTradingRes
  | SignDataRes
  | SignTxRes
  | SetThemeRes
  | GenerateDeviceKeyRes;

export type AnyReq =
  | StartSessionReq
  | PrepareForTradingReq
  | SignDataReq
  | SignTxReq
  | SetThemeReq
  | GenerateDeviceKeyReq;

export type AnyErr =
  | StartSessionErr
  | PrepareForTradingErr
  | SignDataErr
  | SignTxErr
  | SetThemeErr
  | GenerateDeviceKeyErr;

import { Currency } from '../../models/currency/Currency.ts';
import { Output, OutputParams } from '../../models/output/Output.ts';
import { ProtocolParams } from '../../types/ProtocolParams.ts';

export const predictDepositAdaForExecutor = (
  pParams: ProtocolParams,
  params: OutputParams,
): Currency => Output.new(pParams, params).additionalAdaToCoverMinAdaRequired;

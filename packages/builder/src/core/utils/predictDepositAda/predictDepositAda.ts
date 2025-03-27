import { ProtocolParams } from '../../types/ProtocolParams.ts';
import { Output, OutputParams } from '../../models/Output/Output.ts';
import { Currency } from '@splashprotocol/core';

export const predictDepositAda = async (
  pParams: ProtocolParams,
  params: OutputParams,
): Promise<Currency> => {
  return (await Output.new(pParams, params)).additionalAdaToCoverMinAdaRequired;
};

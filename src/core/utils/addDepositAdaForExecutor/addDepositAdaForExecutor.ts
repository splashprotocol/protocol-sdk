import { Currencies } from '../../models/currencies/Currencies.ts';
import { OutputParams } from '../../models/output/Output.ts';
import { ProtocolParams } from '../../types/ProtocolParams.ts';
import { predictDepositAda } from '../predictDepositAdaForExecutor/predictDepositAda.ts';

export const addDepositAdaForExecutorSpec = (
  currenciesToUpdate: Currencies,
  pParams: ProtocolParams,
  params: OutputParams,
): Currencies => {
  const additionalAda = predictDepositAda(pParams, params);

  return currenciesToUpdate.plus([additionalAda]);
};

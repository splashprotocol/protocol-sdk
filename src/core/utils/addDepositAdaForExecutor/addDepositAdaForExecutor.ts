import { Currencies } from '../../models/currencies/Currencies.ts';
import { OutputParams } from '../../models/output/Output.ts';
import { ProtocolParams } from '../../types/ProtocolParams.ts';
import { predictDepositAdaForExecutor } from '../predictDepositAdaForExecutor/predictDepositAdaForExecutor.ts';

export const addDepositAdaForExecutorSpec = (
  currenciesToUpdate: Currencies,
  pParams: ProtocolParams,
  params: OutputParams,
): Currencies => {
  const additionalAda = predictDepositAdaForExecutor(pParams, params);

  return currenciesToUpdate.plus([additionalAda]);
};

import { createValidator } from '../../../common/utils/createValidator/createValidator.ts';
import { PrepareForTradingRes } from '../types/PrepareForTradingRes.ts';
import { PrepareForTradingResult } from '../types/PrepareForTradingResult.ts';

export const prepareForTradingResValidator =
  createValidator<PrepareForTradingRes>({
    type: 'safety-response',
    operation: 'PREPARE_FOR_TRADING',
    isSchemaInvalid: (payload: PrepareForTradingResult) => {
      return (
        typeof payload.pk !== 'string' ||
        typeof payload.pkh !== 'string' ||
        typeof payload.skh !== 'string'
      );
    },
  });

import { Currency } from '../../../../core/models/currency/Currency.ts';

export interface ProtocolStats {
  readonly tvlAda: Currency;
  readonly volumeAda: Currency;
  readonly tvlUsd: Currency;
  readonly volumeUsd: Currency;
  readonly lpFeesAda: Currency;
  readonly lpFeeUsd: Currency;
}

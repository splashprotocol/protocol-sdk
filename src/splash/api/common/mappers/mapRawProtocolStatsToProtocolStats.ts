import { GetProtocolStatsResponse } from '../../../../core/api/types/getProtocolStats/getProtocolStats.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { ProtocolStats } from '../types/ProtocolStats.ts';

export const mapRawProtocolStatsToProtocolStats = (
  rawPs: GetProtocolStatsResponse,
): ProtocolStats => ({
  lpFeesAda: Currency.ada(BigInt(rawPs.lpFeesAda)),
  lpFeeUsd: Currency.usd(BigInt(rawPs.lpFeeUsd)),
  tvlAda: Currency.ada(BigInt(rawPs.tvlAda)),
  tvlUsd: Currency.usd(BigInt(rawPs.tvlUsd)),
  volumeAda: Currency.ada(BigInt(rawPs.volumeAda)),
  volumeUsd: Currency.usd(BigInt(rawPs.volumeUsd)),
});

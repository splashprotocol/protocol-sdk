import { RawProtocolStats } from './RawProtocolStats.ts';
import { ProtocolStats } from '../../../../../types/ProtocolStats.ts';
import { Currency } from '@splashprotocol/core';

export const mapRawProtocolStatsToProtocolStats = (
  rawPs: RawProtocolStats,
): ProtocolStats => ({
  lpFeesAda: Currency.ada(BigInt(rawPs.lpFeesAda)),
  lpFeeUsd: Currency.usd(BigInt(rawPs.lpFeeUsd)),
  tvlAda: Currency.ada(BigInt(rawPs.tvlAda)),
  tvlUsd: Currency.usd(BigInt(rawPs.tvlUsd)),
  volumeAda: Currency.ada(BigInt(rawPs.volumeAda)),
  volumeUsd: Currency.usd(BigInt(rawPs.volumeUsd)),
});

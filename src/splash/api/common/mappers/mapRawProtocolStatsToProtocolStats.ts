import { GetProtocolStatsResponse } from '../../../../core/api/types/getProtocolStats/getProtocolStats.ts';
import { ada } from '../../../../core/models/assetInfo/ada.ts';
import { usd } from '../../../../core/models/assetInfo/usd.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { toBigNumRepresentation } from '../../../../core/utils/math/math.ts';
import { ProtocolStats } from '../types/ProtocolStats.ts';

export const mapRawProtocolStatsToProtocolStats = (
  rawPs: GetProtocolStatsResponse,
): ProtocolStats => ({
  lpFeesAda: Currency.ada(
    toBigNumRepresentation(rawPs.lpFeesAda.toFixed(ada.decimals), ada.decimals),
  ),
  lpFeeUsd: Currency.usd(
    toBigNumRepresentation(rawPs.lpFeeUsd.toFixed(usd.decimals), usd.decimals),
  ),
  tvlAda: Currency.ada(
    toBigNumRepresentation(rawPs.tvlAda.toFixed(ada.decimals), ada.decimals),
  ),
  tvlUsd: Currency.usd(
    toBigNumRepresentation(rawPs.tvlUsd.toFixed(usd.decimals), usd.decimals),
  ),
  volumeAda: Currency.ada(
    toBigNumRepresentation(rawPs.volumeAda.toFixed(ada.decimals), ada.decimals),
  ),
  volumeUsd: Currency.usd(
    toBigNumRepresentation(rawPs.volumeUsd.toFixed(usd.decimals), usd.decimals),
  ),
});

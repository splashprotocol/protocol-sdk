import { AssetInfo } from './AssetInfo.ts';

export const usd = AssetInfo.new(
  {
    policyId: '',
    name: 'usd',
    type: 'raw',
  },
  {
    decimals: 2,
    ticker: '$',
  },
);

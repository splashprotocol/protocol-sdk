import { AssetInfo } from './AssetInfo.ts';

export const usd = AssetInfo.new(
  {
    policyId: '',
    name: 'usd',
    type: 'raw',
  },
  {
    name: 'usd',
    policyId: '',
    decimals: 2,
    ticker: '$',
  },
);

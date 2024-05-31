import { AssetMetadata } from '../../api/types/common/AssetMetadata.ts';
import { Dictionary } from '../../types/types.ts';

export let metadataCache: Dictionary<AssetMetadata> = {
  '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75.535046': {
    name: 'SPF',
    ticker: 'SPF',
    decimals: 6,
    subject: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75535046',
    policyId: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
    logo: 'https://spectrum.fi/logos/cardano/09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75535046.webp',
  },
  '.': {
    name: '',
    policyId: '',
    subject: '',
    logo: 'https://spectrum.fi/logos/cardano/token-ada.svg',
    decimals: 6,
    ticker: 'ADA',
  },
  '.757364': {
    name: 'usd',
    policyId: '',
    subject: 'usd',
    decimals: 2,
    ticker: '$',
  },
};

export const setMetadataCache = (cache: Dictionary<AssetMetadata>) => {
  metadataCache = cache;
};

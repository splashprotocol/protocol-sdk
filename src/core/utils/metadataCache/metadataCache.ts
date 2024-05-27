import { AssetMetadata } from '../../api/types/common/AssetMetadata.ts';
import { Dictionary } from '../../types/types.ts';

export let metadataCache: Dictionary<AssetMetadata> = {};

export const setMetadataCache = (cache: Dictionary<AssetMetadata>) => {
  metadataCache = cache;
};

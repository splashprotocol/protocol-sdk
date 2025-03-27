import { AssetId } from '../../../types/AssetId.ts';
import { AssetSubject } from '../../../types/AssetSubject.ts';

/**
 * Returns subject by assetId
 * @param {AssetId} assetId
 * @returns {AssetSubject}
 */
export const assetIdToSubject = (assetId: AssetId): AssetSubject => {
  return assetId.split('.').join('');
};

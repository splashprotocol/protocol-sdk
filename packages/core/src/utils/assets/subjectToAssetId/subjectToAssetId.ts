import { AssetSubject } from '../../../types/AssetSubject.ts';
import { AssetId } from '../../../types/AssetId.ts';

/**
 * Returns assetId by subject
 * @param {AssetSubject} subject
 * @returns {AssetId}
 */
export const subjectToAssetId = (subject: AssetSubject): AssetId => {
  return `${subject.slice(0, 56)}.${subject.slice(56, subject.length)}`;
};

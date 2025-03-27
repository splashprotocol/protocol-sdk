import { CredentialType } from './CredentialType.ts';
import { HexString } from '../../../../types/HexString.ts';

export interface Credential {
  readonly type: CredentialType;
  readonly hash: HexString;
}

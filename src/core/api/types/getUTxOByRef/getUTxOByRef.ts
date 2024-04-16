import { OutputReference } from '../../../types/types.ts';
import { RawUTxO } from '../common/RawUTxO.ts';

export type GetUTxOByRefParams = OutputReference;

export type GetUTxOByRefResult = RawUTxO | undefined;

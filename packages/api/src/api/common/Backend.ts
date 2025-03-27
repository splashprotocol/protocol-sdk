import { Network } from '@splashprotocol/core';
import { BasicApi } from './BasicApi.ts';

export type BackendMethodArgument<P> = {
  readonly params: P;
  readonly api: BasicApi;
};

export type Backend<T, OT = Omit<Omit<T, 'network'>, 'getAssetMetadata'>> = {
  readonly network: Network;
} & {
  [key in keyof OT]: (config: BackendMethodArgument<any>) => any;
};

import { SplashOperationsConfig } from '../../../../core/types/SplashOperationsConfig.ts';
import { ApiWrapper } from '../../../api/ApiWrapper.ts';
import { Utils } from '../../../utils/Utils.ts';

export interface OperationMetadataConfig {
  readonly api: ApiWrapper;
  readonly utils: Utils;
  readonly operationsConfig: SplashOperationsConfig;
}

export type OperationMetadata = <T>(
  operationsConfig: SplashOperationsConfig,
) => T;

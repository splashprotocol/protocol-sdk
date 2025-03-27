import {
  SplashBackend,
  SplashBackendConfig,
} from '../backends/splash/SplashBackend.ts';
import { Api, createApi } from '../createApi.ts';

export const SplashApi = (config: SplashBackendConfig): Api<SplashBackend> => {
  return createApi(SplashBackend.new(config));
};

export type SplashApiType = ReturnType<typeof SplashApi>;

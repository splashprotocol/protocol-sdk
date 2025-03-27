import { SplashOperationsConfig } from './SplashOperationsConfig.ts';

let cache: Promise<SplashOperationsConfig>;

export const getSplashOperationConfig = (): Promise<SplashOperationsConfig> => {
  if (!cache) {
    cache = fetch('https://spectrum.fi/settings.json').then((res) =>
      res.json(),
    );
  }
  return cache;
};

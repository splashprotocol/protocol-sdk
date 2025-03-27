import { Api, SplashBackend } from '@splashprotocol/api';

import { BuilderExplorer } from '../../core/types/BuilderExplorer.ts';
import { spotOrder } from './operations/spotOrder/spotOrder.ts';
import { cancelOperation } from './operations/cancelOperation/cancelOperation.ts';
import { BuilderLegacy } from '../../core/BuilderLegacy.ts';
import { xyDeposit } from './operations/xyDeposit/xyDeposit.ts';
import { xyRedeem } from './operations/xyRedeem/xyRedeem.ts';
import { createWeightedPool } from './operations/createWeightedPool/createWeightedPool.ts';
import { createCfmmPool } from './operations/createCfmmPool/createCfmmPool.ts';
import { SplashRemoteCollaterals } from '../../core/legacyUtils/remoteCollaterals/SplashRemoteCollaterals.ts';

export const SplashBuilder = (
  api: Api<SplashBackend>,
  explorer: BuilderExplorer,
) => {
  return new BuilderLegacy(api, explorer, SplashRemoteCollaterals.new(), {
    spotOrder,
    cancelOperation,
    xyDeposit,
    xyRedeem,
    createWeightedPool,
    createCfmmPool,
  });
};

import * as events from 'events';

import { SpectrumExplorer } from './explorer/spectrum/SpectrumExplorer.ts';
import { init } from './init.ts';

init(new SpectrumExplorer('mainnet'));
//
// init(new SpectrumExplorer('mainnet'), {
//   wallet: cip30,
//   events: {
//     walletChange: (newWallet, oldWallet) => {},
//     walletConnectError: () => {},
//     walletEnableChange: () => {},
//   },
// });
//
// events('walletChange').off();
// events('walletChange').on(() => {
//
// });

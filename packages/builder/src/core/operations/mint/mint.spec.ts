import { Currency } from '@splashprotocol/core';
import { SplashApi } from '@splashprotocol/api';
import { TransactionCandidate } from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { UTxOsSelector } from '../../utils/UTxOsSelector/UTxOsSelector.ts';
import { CML } from '../../utils/Cml/Cml.ts';

import { mint } from './mint.ts';
import { SplashExplorer } from '../../../explorers/splash/SplashExplorer.ts';

test('it should adds mint to tx candidate', async () => {
  const api = SplashApi({ network: 'mainnet' });
  const explorer = SplashExplorer.new('mainnet');
  const transactionCandidate = TransactionCandidate.new();
  await mint({
    asset: Currency.ada(1n),
    scriptHash: 'test',
    uTxORef: {
      index: 1n,
      txHash: '132',
    },
    redeemer: '',
  })({
    nContext: await explorer.getNetworkContext(),
    api,
    explorer,
    network: 'mainnet',
    userAddress:
      'addr1q9cehmjzf2tmtzeae2y0uhdxl6kxf992wgn0ja0n2pk9kftcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxsqwq3mt',
    pParams: await explorer.getProtocolParams(),
    transactionCandidate: transactionCandidate,
    collateralSelector: UTxOsSelector.new({ uTxOs: [] }),
    uTxOsSelector: UTxOsSelector.new({ uTxOs: [] }),
    C: await CML,
  });

  expect(transactionCandidate.mints[0].asset.amount).toBe(1n);
});

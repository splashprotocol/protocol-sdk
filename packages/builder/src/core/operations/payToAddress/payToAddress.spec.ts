import { payToAddress } from './payToAddress.ts';
import { Currencies, Currency } from '@splashprotocol/core';
import { SplashApi } from '@splashprotocol/api';
import { TransactionCandidate } from '../../models/TransactionCandidate/TransactionCandidate.ts';
import { UTxOsSelector } from '../../utils/UTxOsSelector/UTxOsSelector.ts';
import { CML } from '../../utils/Cml/Cml.ts';
import { Output } from '../../models/Output/Output.ts';
import { SplashExplorer } from '../../../explorers/splash/SplashExplorer.ts';

test('it should returns valid output', async () => {
  const api = SplashApi({ network: 'mainnet' });
  const explorer = SplashExplorer.new('mainnet');
  const transactionCandidate = TransactionCandidate.new();
  const result = await payToAddress(
    'addr1q9cehmjzf2tmtzeae2y0uhdxl6kxf992wgn0ja0n2pk9kftcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxsqwq3mt',
    Currencies.new([Currency.ada(1000000n)]),
  )({
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

  expect(result).toBeInstanceOf(Output);
  expect(result.userValue.ada.amount).toBe(1000000n);
  expect(result.totalValue.ada.amount).toBe(1000000n);
  expect(result.isUserValueCoverMinAdaRequired).toBe(true);
  expect(result.additionalAdaToCoverMinAdaRequired.amount).toBe(0n);
  expect(result.address).toBe(
    'addr1q9cehmjzf2tmtzeae2y0uhdxl6kxf992wgn0ja0n2pk9kftcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxsqwq3mt',
  );
  expect(transactionCandidate.outputs[0]).toBe(result);
});

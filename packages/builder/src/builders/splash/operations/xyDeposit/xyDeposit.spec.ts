import { SplashApi } from '@splashprotocol/api';
import { SplashExplorer } from '../../../../explorers/splash/SplashExplorer.ts';
import { TransactionCandidate } from '../../../../core/models/TransactionCandidate/TransactionCandidate.ts';
import { cip30Bridge } from '../common/cip30Emulator.ts';
import { UTxO } from '../../../../core/models/UTxO/UTxO.ts';
import { UTxOsSelector } from '../../../../core/utils/UTxOsSelector/UTxOsSelector.ts';
import { CML } from '../../../../core/utils/Cml/Cml.ts';
import { xyDeposit } from './xyDeposit.ts';
import { Currency } from '@splashprotocol/core';

test('should create valid xyDeposit output', async () => {
  const api = SplashApi({ network: 'mainnet' });
  const explorer = SplashExplorer.new('mainnet');
  const transactionCandidate = TransactionCandidate.new();
  api.selectWallet(cip30Bridge);
  const uTxOs = await api
    .getWalletContext()
    .then((ctx) => ctx.getUtxos())
    .then((uTxOs) =>
      uTxOs ? Promise.all(uTxOs.map((uTxO) => UTxO.new({ cbor: uTxO }))) : [],
    );
  const pools = await api.getSplashPools({ duplicated: true, verified: true });
  const spfPool = pools.find(
    (pool) =>
      pool.nft.assetId ===
      'a80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf.5350465f4144415f4e4654',
  )!;

  const result = await xyDeposit(spfPool, [
    Currency.ada(377575n),
    Currency.spf(20000000n),
  ])({
    nContext: await explorer.getNetworkContext(),
    api,
    explorer,
    network: 'mainnet',
    userAddress: await api.getActiveAddress(),
    pParams: await explorer.getProtocolParams(),
    transactionCandidate: transactionCandidate,
    collateralSelector: UTxOsSelector.new({ uTxOs: [] }),
    uTxOsSelector: UTxOsSelector.new({ uTxOs: uTxOs }),
    C: await CML,
  });

  expect(result.address).toBe(
    'addr1wyr4uz0tp75fu8wrg6gm83t20aphuc9vt6n8kvu09ctkugqpsrmeh',
  );
  expect(result.data).toBe(
    'd87988d87982581ca80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf4b5350465f4144415f4e4654d879824040d87982581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e7543535046d87982581c74f47c99ac793c29280575b08fe20c7fb75543bff5b1581f7c162e7c4a5350465f4144415f4c511a0016e360581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d87981581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f1a0016e360',
  );
  expect(result.minAdaRequired.amount).toBe(1969670n);
  expect(result.totalValue.ada.amount).toBe(3377575n);
  expect(result.totalValue.spf.amount).toBe(20000000n);
});

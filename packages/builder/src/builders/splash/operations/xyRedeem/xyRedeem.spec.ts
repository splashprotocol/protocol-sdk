import { SplashApi } from '@splashprotocol/api';
import { SplashExplorer } from '../../../../explorers/splash/SplashExplorer.ts';
import { TransactionCandidate } from '../../../../core/models/TransactionCandidate/TransactionCandidate.ts';
import { cip30Bridge } from '../common/cip30Emulator.ts';
import { UTxO } from '../../../../core/models/UTxO/UTxO.ts';
import { UTxOsSelector } from '../../../../core/utils/UTxOsSelector/UTxOsSelector.ts';
import { CML } from '../../../../core/utils/Cml/Cml.ts';
import { xyRedeem } from './xyRedeem.ts';

test('should create valid xyRedeem output', async () => {
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
  const squirtPool = pools.find(
    (pool) =>
      pool.nft.assetId ===
      'ad876d76b453e6c4e4f427717a4afc57439a988d8e4a1eb57f543446.5351554952545f4144415f4e4654',
  )!;

  const result = await xyRedeem(
    squirtPool,
    squirtPool.lq.withAmount(253297071252n),
  )({
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
    'addr1wxu29wa80fd4ptpfwqe20vpxrum45f57ud3r6egh9vuyhfc2a3jhj',
  );
  expect(result.data).toBe(
    'd87987d87982581cad876d76b453e6c4e4f427717a4afc57439a988d8e4a1eb57f5434464e5351554952545f4144415f4e4654d879824040d87982581c5ac3d4bdca238105a040a565e5d7e734b7c9e1630aec7650e809e34a46535155495254d87982581c610140406c24c52d4e630b022201d36d2b1ba0d044237d7bd138d33d4d5351554952545f4144415f4c511a0016e360581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d87981581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f',
  );
  expect(result.minAdaRequired.amount).toBe(2047250n);
  expect(result.totalValue.ada.amount).toBe(3000000n);
  expect(result.totalValue.get(squirtPool.lq.asset).amount).toBe(253297071252n);
});

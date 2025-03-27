import { SplashApi } from '@splashprotocol/api';
import { SplashExplorer } from '../../../../explorers/splash/SplashExplorer.ts';
import { TransactionCandidate } from '../../../../core/models/TransactionCandidate/TransactionCandidate.ts';
import { cip30Bridge } from '../common/cip30Emulator.ts';
import { UTxO } from '../../../../core/models/UTxO/UTxO.ts';

import { UTxOsSelector } from '../../../../core/utils/UTxOsSelector/UTxOsSelector.ts';
import { CML } from '../../../../core/utils/Cml/Cml.ts';
import { createWeightedPool } from './createWeightedPool.ts';
import { AssetInfo, Currency } from '@splashprotocol/core';

test('it should create valid pool creation output', async () => {
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

  const result = await createWeightedPool({
    x: Currency.ada(200000000n),
    xWeight: 20,
    y: Currency.splash(800000000n),
    yWeight: 80,
    poolFee: 0.3,
    treasuryFee: 0.03,
    editableFee: true,
  })({
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
    'addr1x8zjsd5fagcwpysv2zklwu69kkqfcpwfvtxpz8s0r5kmakaj764lvrxdayh2ux30fl0ktuh27csgmpevdu89jlxppvrszgx7ef',
  );
  expect(result.data).toBe(
    'd8798ad87982581c74a05af540a8a504fc11e907c6eb204ec8d0e898c0093aca1b8a164a4e53504c4153485f4144415f4e4654d879824040d87982581cececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e34653504c415348d87982581ced47f9110ace85f69fb61ba0044a8749fbfbf0b9a3d4b195fd0136574d53504c4153485f4144415f4c511a00018574181e000081d87981d87a81581c6f240631775c1213bf0ee46e7f6ab21464dbd60057a9bc21a6cb1e0c581c75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
  );
  expect(result.data).toBe(
    'd8798ad87982581c74a05af540a8a504fc11e907c6eb204ec8d0e898c0093aca1b8a164a4e53504c4153485f4144415f4e4654d879824040d87982581cececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e34653504c415348d87982581ced47f9110ace85f69fb61ba0044a8749fbfbf0b9a3d4b195fd0136574d53504c4153485f4144415f4c511a00018574181e000081d87981d87a81581c6f240631775c1213bf0ee46e7f6ab21464dbd60057a9bc21a6cb1e0c581c75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
  );
  expect(result.totalValue.ada.amount).toBe(200000000n);
  expect(
    result.totalValue.get(
      AssetInfo.fromAssetId(
        'ed47f9110ace85f69fb61ba0044a8749fbfbf0b9a3d4b195fd013657.53504c4153485f4144415f4c51',
      ),
    ).amount,
  ).toBe(9223372036248489181n);
});

import { SplashApi } from '@splashprotocol/api';
import { SplashExplorer } from '../../../../explorers/splash/SplashExplorer.ts';
import { TransactionCandidate } from '../../../../core/models/TransactionCandidate/TransactionCandidate.ts';
import { UTxOsSelector } from '../../../../core/utils/UTxOsSelector/UTxOsSelector.ts';
import { CML } from '../../../../core/utils/Cml/Cml.ts';
import { spotOrder } from './spotOrder.ts';
import { cip30Bridge } from '../common/cip30Emulator.ts';
import { UTxO } from '../../../../core/models/UTxO/UTxO.ts';
import { AssetInfo, Currency, Price } from '@splashprotocol/core';

test('it should returns valid output', async () => {
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

  const result = await spotOrder({
    price: Price.new({
      value: '1',
      quote: AssetInfo.ada,
      base: AssetInfo.splash,
    }),
    input: Currency.ada(1_000_000n),
    outputAsset: AssetInfo.splash,
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
    'addr1z9ryamhgnuz6lau86sqytte2gz5rlktv2yce05e0h3207qk70pn0u5rga0euslwdk45d555d5hwttajemxmqqy88g58ssw2gdl',
  );
  expect(result.data).toBe(
    'd8798c4100581cfda358ef11a12275ffc39eb3feeed690fcc061dd83d32bec7954d593d8798240401a000f42401a000dbba01a0003d090d87982581cececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e34653504c415348d87982010100d87982d87981581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d87981d87981d87981581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d9115349643081581c5cb2c968e5d1c7197a6ce7615967310a375545d9bc65063a964335b2',
  );
  expect(result.minAdaRequired.amount).toBe(2038630n);
  expect(result.isUserValueCoverMinAdaRequired).toBe(true);
  expect(result.additionalAdaToCoverMinAdaRequired.amount).toBe(0n);
  expect(result.userValue.ada.amount).toBe(6100000n);
  expect(result.totalValue.ada.amount).toBe(6100000n);
});

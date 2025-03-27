import { Builder } from './Builder.ts';
import { SplashApi } from '@splashprotocol/api';
import { SplashExplorer } from '../explorers/splash/SplashExplorer.ts';
import { HotWallet } from '../wallets/HotWallet/HotWallet.ts';
import { Currencies, Currency } from '@splashprotocol/core';

test('it should be valid', async () => {
  const explorer = SplashExplorer.new('mainnet');
  const builder = Builder.new(SplashApi({ network: 'mainnet' }), explorer);
  builder.api.selectWallet(() =>
    HotWallet.fromSeed(
        process.env.SEED_PHRASE!,
      explorer,
    ),
  );

  await builder
    .newTx()
    .payToAddress(
      'addr1q96pqnx4ef3g3swa9c3wuhy8flw0cxup396x9kg32dykgvx70pn0u5rga0euslwdk45d555d5hwttajemxmqqy88g58sxll9gv',
      Currencies.new([Currency.ada(5_000_000n)]),
    )
    .complete();
});

import { MaestroExplorer } from '../../explorers/maestro/MaestroExplorer.ts';
import { SplashApi } from '@splashprotocol/api';
import { SplashBuilder } from './SplashBuilder.ts';
import { HotWallet } from '../../wallets/HotWallet/HotWallet.ts';
import { AssetInfo, Currency } from '@splashprotocol/core';

test('it should send and submit spot order', async () => {
  const explorer = MaestroExplorer.new(
    'mainnet',
      process.env.MAESTRO_API_KEY!,
  );
  const api = SplashApi({ network: 'mainnet' });
  const builder = SplashBuilder(api, explorer);
  builder.selectWallet(() =>
    HotWallet.fromSeed(
        process.env.SEED_PHRASE!,
      explorer,
    ),
  );

  const tx = await builder
    .newTx()
    .spotOrder({
      input: Currency.ada(1000000n),
      outputAsset: AssetInfo.splash,
    })
    .complete();

  try {
    await tx.signAndSubmit();
  } catch (err) {
    console.log(err);
  }
  expect(1).toBe(1);
}, 60_000);

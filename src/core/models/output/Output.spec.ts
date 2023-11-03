import {
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { SpectrumExplorer } from '../../../explorer/spectrum/SpectrumExplorer.ts';
import { init } from '../../../init.ts';
import { AssetAmount } from '../assetAmount/AssetAmount.ts';
import { AssetAmountSet } from '../assetAmountSet/AssetAmountSet.ts';
import { Datum } from '../datum/DatumConstructor.ts';
import { Output } from './Output.ts';

const expectedAddress = `addr1q9lr22dud06hkcp9vyyltag7g6jza27w0j0lhuveajqzmsmcgmmtkpl4k2p93p0y2qn8ne5eknnq5rzxpxjxhs652nxscp8ra5`;

test('it should throws error without sdk initialization', async () => {
  try {
    await Output.createWithoutDatum('', new AssetAmountSet([]));
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should creates output without datum', async () => {
  init(new SpectrumExplorer('mainnet'));
  const output = await Output.createWithoutDatum(
    expectedAddress,
    new AssetAmountSet([AssetAmount.adaAssetAmount(1000000n)]),
  );

  expect(output).toBeInstanceOf(Output);
  expect(output.address).toBe(expectedAddress);
  expect(output.userAssetAmountSet).toBeInstanceOf(AssetAmountSet);
  expect(output.datum).toBe(undefined);
});

test('it should creates output with datum', async () => {
  init(new SpectrumExplorer('mainnet'));
  const output = await Output.createWithDatum(
    expectedAddress,
    new AssetAmountSet([AssetAmount.adaAssetAmount(1000000n)]),
    Datum.stub(PlutusData.new_list(PlutusList.new())),
  );

  expect(output).toBeInstanceOf(Output);
  expect(output.address).toBe(expectedAddress);
  expect(output.userAssetAmountSet).toBeInstanceOf(AssetAmountSet);
  expect(output.datum).toBeInstanceOf(Datum);
});

test('it should returns asset amount set with ada only', async () => {
  init(new SpectrumExplorer('mainnet'));
  const output = await Output.createWithDatum(
    expectedAddress,
    new AssetAmountSet([AssetAmount.adaAssetAmount(2000000n)]),
    Datum.stub(PlutusData.new_list(PlutusList.new())),
  );

  expect(output.totalAssetAmountSet.toAssetAmountArray().length).toBe(1);
  expect(output.totalAssetAmountSet.getAda()?.amount).toBe(2000000n);
});

test('it should returns asset amount set with spf and ada', async () => {
  init(new SpectrumExplorer('mainnet'));
  const output = await Output.createWithDatum(
    expectedAddress,
    new AssetAmountSet([AssetAmount.spfAssetAmount(2000000n)]),
    Datum.stub(PlutusData.new_list(PlutusList.new())),
  );

  expect(output.totalAssetAmountSet.toAssetAmountArray().length).toBe(2);
  expect(typeof output.totalAssetAmountSet.getAda()?.amount).toBe('bigint');
});

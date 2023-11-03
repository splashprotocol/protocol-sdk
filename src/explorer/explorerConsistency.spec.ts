import { BlockfrostExplorer } from './blockfrost/BlockfrostExplorer.ts';
import { SpectrumExplorer } from './spectrum/SpectrumExplorer.ts';

test('it should receive same data', async () => {
  const spectrumExplorerPParams = await new SpectrumExplorer(
    'mainnet',
  ).getProtocolParams();
  const blockfrostExplorerPParams = await new BlockfrostExplorer(
    'mainnetCCSCiylTrI2vfVQWQh43fNVFqnRRAvpn',
    'mainnet',
  ).getProtocolParams();
  //
  expect(spectrumExplorerPParams.network).toBe(
    blockfrostExplorerPParams.network,
  );
  expect(spectrumExplorerPParams.protocolVersion.minor).toBe(
    blockfrostExplorerPParams.protocolVersion.minor,
  );
  expect(spectrumExplorerPParams.protocolVersion.major).toBe(
    blockfrostExplorerPParams.protocolVersion.major,
  );
  expect(spectrumExplorerPParams.minUTxOValue).toBe(
    blockfrostExplorerPParams.minUTxOValue,
  );
  expect(spectrumExplorerPParams.txFeeFixed).toBe(
    blockfrostExplorerPParams.txFeeFixed,
  );
  expect(spectrumExplorerPParams.coinsPerUtxoByte).toBe(
    blockfrostExplorerPParams.coinsPerUtxoByte,
  );
  expect(spectrumExplorerPParams.maxTxSize).toBe(
    blockfrostExplorerPParams.maxTxSize,
  );
  expect(spectrumExplorerPParams.executionUnitPrices.priceSteps).toBe(
    blockfrostExplorerPParams.executionUnitPrices.priceSteps,
  );
  expect(spectrumExplorerPParams.executionUnitPrices.priceMemory).toBe(
    blockfrostExplorerPParams.executionUnitPrices.priceMemory,
  );
  expect(spectrumExplorerPParams.collateralPercentage).toBe(
    blockfrostExplorerPParams.collateralPercentage,
  );
  expect(spectrumExplorerPParams.maxCollateralInputs).toBe(
    blockfrostExplorerPParams.maxCollateralInputs,
  );
  expect(spectrumExplorerPParams.txFeePerByte).toBe(
    blockfrostExplorerPParams.txFeePerByte,
  );
  expect(spectrumExplorerPParams.maxValueSize).toBe(
    blockfrostExplorerPParams.maxValueSize,
  );
  expect(spectrumExplorerPParams.maxTxExecutionUnits.steps).toBe(
    blockfrostExplorerPParams.maxTxExecutionUnits.steps,
  );
  expect(spectrumExplorerPParams.maxTxExecutionUnits.memory).toBe(
    blockfrostExplorerPParams.maxTxExecutionUnits.memory,
  );
});

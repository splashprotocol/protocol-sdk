import { SpectrumExplorer } from './SpectrumExplorer.ts';

test('it should returns valid protocol params', async () => {
  const pParams = await new SpectrumExplorer('mainnet').getProtocolParams();

  expect(pParams.network).toBe('mainnet');
  expect(typeof pParams.protocolVersion.minor).toBe('number');
  expect(typeof pParams.protocolVersion.major).toBe('number');
  expect(typeof pParams.minUTxOValue).toBe('bigint');
  expect(typeof pParams.txFeeFixed).toBe('bigint');
  expect(typeof pParams.coinsPerUtxoByte).toBe('bigint');
  expect(typeof pParams.maxTxSize).toBe('bigint');
  expect(typeof pParams.executionUnitPrices.priceSteps).toBe('number');
  expect(typeof pParams.executionUnitPrices.priceMemory).toBe('number');
  expect(typeof pParams.collateralPercentage).toBe('number');
  expect(typeof pParams.maxCollateralInputs).toBe('number');
  expect(typeof pParams.txFeePerByte).toBe('bigint');
  expect(typeof pParams.maxValueSize).toBe('bigint');
  expect(typeof pParams.maxTxExecutionUnits.steps).toBe('bigint');
  expect(typeof pParams.maxTxExecutionUnits.memory).toBe('bigint');
});

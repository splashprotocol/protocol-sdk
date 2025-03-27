import { getCostModels } from './getCostModels.ts';
import type { TransactionBuilderConfig } from '@dcspark/cardano-multiplatform-lib-browser';
import { valueToRational } from '@splashprotocol/core';
import { InferPromise } from '../../types/InferPromise.ts';
import { CML } from '../Cml/Cml.ts';
import { ProtocolParams } from '../../types/ProtocolParams.ts';

export const getTransactionBuilderConfig = (
  pParams: ProtocolParams,
  C: InferPromise<typeof CML>,
): TransactionBuilderConfig => {
  const memPriceRaw = valueToRational(pParams.executionUnitPrices.priceMemory);
  const memPrice = C.Rational.new(
    memPriceRaw.numerator,
    memPriceRaw.denominator,
  );

  const stepPriceRaw = valueToRational(pParams.executionUnitPrices.priceSteps);
  const stepPrice = C.Rational.new(
    stepPriceRaw.numerator,
    stepPriceRaw.denominator,
  );

  return C.TransactionBuilderConfigBuilder.new()
    .max_collateral_inputs(pParams.maxCollateralInputs)
    .collateral_percentage(pParams.collateralPercentage)
    .coins_per_utxo_byte(pParams.coinsPerUtxoByte)
    .max_value_size(pParams.maxValueSize)
    .max_tx_size(Math.floor(pParams.maxTxSize * 2))
    .fee_algo(C.LinearFee.new(pParams.txFeePerByte, pParams.txFeeFixed, 15n))
    .key_deposit(pParams.keyDeposit)
    .pool_deposit(pParams.poolDeposit)
    .ex_unit_prices(C.ExUnitPrices.new(memPrice, stepPrice))
    .cost_models(getCostModels(C))
    .prefer_pure_change(true)
    .build();
};

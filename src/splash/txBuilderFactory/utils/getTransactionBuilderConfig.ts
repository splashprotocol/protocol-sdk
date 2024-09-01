import {
  ExUnitPrices,
  LinearFee,
  Rational,
  TransactionBuilderConfig,
  TransactionBuilderConfigBuilder,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { ProtocolParams } from '../../../core/types/ProtocolParams.ts';
import { numberToRational } from '../../../core/utils/math/math.ts';
import { getCostModels } from './getCostModels.ts';

export const getTransactionBuilderConfig = (
  pParams: ProtocolParams,
): TransactionBuilderConfig => {
  const memPriceRaw = numberToRational(pParams.executionUnitPrices.priceMemory);
  const memPrice = Rational.new(memPriceRaw.numerator, memPriceRaw.denominator);

  const stepPriceRaw = numberToRational(pParams.executionUnitPrices.priceSteps);
  const stepPrice = Rational.new(
    stepPriceRaw.numerator,
    stepPriceRaw.denominator,
  );

  return TransactionBuilderConfigBuilder.new()
    .max_collateral_inputs(pParams.maxCollateralInputs)
    .collateral_percentage(pParams.collateralPercentage)
    .coins_per_utxo_byte(pParams.coinsPerUtxoByte)
    .max_value_size(pParams.maxValueSize)
    .max_tx_size(Math.floor(pParams.maxTxSize * 2))
    .fee_algo(LinearFee.new(pParams.txFeePerByte, pParams.txFeeFixed, 15n))
    .key_deposit(pParams.keyDeposit)
    .pool_deposit(pParams.poolDeposit)
    .ex_unit_prices(ExUnitPrices.new(memPrice, stepPrice))
    .cost_models(getCostModels())
    .prefer_pure_change(true)
    .build();
};

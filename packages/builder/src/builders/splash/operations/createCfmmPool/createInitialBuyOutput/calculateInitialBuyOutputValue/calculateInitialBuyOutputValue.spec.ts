import { calculateInitialBuyOutputValue } from './calculateInitialBuyOutputValue.ts';
import { Currency } from '@splashprotocol/core';

test('it should returns valid output amount', () => {
  const output = calculateInitialBuyOutputValue({
    x: Currency.ada(200_000_000n),
    y: Currency.splash(700_000_000n),
    poolFee: 97300n,
    treasuryFee: 300n,
    input: Currency.ada(5_000_000n),
  });

  console.log(output);
});

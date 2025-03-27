import { Currency, math, Price, uint } from '@splashprotocol/core';

export interface GetBasePriceConfig {
  readonly input: Currency;
  readonly output: Currency;
  readonly slippage: uint;
}
export const getBasePrice = ({
  output,
  input,
  slippage,
}: GetBasePriceConfig): Price => {
  return Price.new({
    value: math.evaluate(`${output.amount} / ${input.amount}`).toFixed(),
    base: input.asset,
    quote: output.asset,
  }).priceFromPct(100 - slippage);
};

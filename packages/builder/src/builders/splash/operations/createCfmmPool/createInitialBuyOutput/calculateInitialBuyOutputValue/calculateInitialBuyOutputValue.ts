import { Currency, math } from '@splashprotocol/core';

export interface CalculateInitialBuyOutputParams {
  readonly input: Currency;
  readonly x: Currency;
  readonly y: Currency;
  readonly poolFee: bigint;
  readonly treasuryFee: bigint;
}

export const calculateInitialBuyOutputValue = ({
  input,
  x,
  y,
  poolFee,
  treasuryFee,
}: CalculateInitialBuyOutputParams): Currency => {
  const totalFee = math.evaluate(`${poolFee} - ${treasuryFee}`).floor();

  return y.withAmount(
    BigInt(
      math
        .evaluate(
          `(${y.amount} * ${input.amount} * ${totalFee}) / ((${x.amount}) * ${100000} + ${input.amount} * ${totalFee})`,
        )
        .floor()
        .toFixed(),
    ),
  );
};

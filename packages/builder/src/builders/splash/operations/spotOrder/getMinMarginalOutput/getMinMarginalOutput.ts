import { AssetInfo, Currency, math, Price } from '@splashprotocol/core';

interface GetMinMarginalOutputConfig {
  readonly basePrice: Price;
  readonly input: Currency;
  readonly stepCount: bigint;
  readonly outputAsset: AssetInfo;
}
export const getMinMarginalOutput = async ({
  input,
  basePrice,
  stepCount,
  outputAsset,
}: GetMinMarginalOutputConfig): Promise<Currency> => {
  return Currency.new(
    BigInt(
      Math.floor(
        math
          .evaluate(
            `${basePrice.getNecessaryQuoteFor(input).amount} / ${stepCount}`,
          )
          .toFixed(),
      ),
    ),
    outputAsset,
  );
};

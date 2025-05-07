import { AssetId, AssetInfo, Currency, uint } from '@splashprotocol/core';

export interface ExecutorFeePair {
  readonly base: AssetId;
  readonly quote: AssetId;
}

export interface Step {
  readonly min: string;
  readonly max: string;
  readonly fee: string;
}

export interface ExecutorFee {
  readonly version: uint;
  readonly config: {
    pair: ExecutorFeePair;
    fromAdaSteps: Step[];
    fromAssetSteps: Step[];
  };
}

const getUrl = (network: 'mainnet' | 'preprod' | 'staging'): string => {
  switch (network) {
    case 'staging':
      return 'https://api-test-mainnet.splash.trade/v1/fees-api/distribution/by/pair';
    case 'preprod':
      return 'https://api-test-mainnet.splash.trade/v1/fees-api/distribution/by/pair';
    case 'mainnet':
      return 'https://analytics.splash.trade/platform-api/v1/fees-api/distribution/by/pair';
  }
};

export const getExecutorFee = async (
  network: 'mainnet' | 'preprod' | 'staging',
  input: Currency,
  outputAsset: AssetInfo,
): Promise<bigint | undefined> => {
  const url: string = getUrl(network);

  const feesTable: ExecutorFee | undefined = await fetch(
    `${url}?from=${input.asset.assetId}&to=${outputAsset.assetId}`,
  )
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      return undefined;
    })
    .catch(() => undefined);
  if (!feesTable) {
    return undefined;
  }
  if (input.isAda()) {
    const fee = feesTable.config.fromAdaSteps.find(
      (step) =>
        BigInt(step.min) <= input.amount &&
        ((step.max && input.amount < BigInt(step.max)) || !step.max),
    )?.fee;

    return fee ? BigInt(fee) : undefined;
  } else {
    const fee = feesTable.config.fromAssetSteps.find(
      (step) =>
        BigInt(step.min) <= input.amount &&
        ((step.max && input.amount < BigInt(step.max)) || !step.max),
    )?.fee;

    return fee ? BigInt(fee) : undefined;
  }
};

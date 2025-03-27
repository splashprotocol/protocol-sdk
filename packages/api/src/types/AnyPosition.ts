import {
  CfmmPool,
  Position,
  StablePool,
  WeightedPool,
} from '@splashprotocol/core';

export type AnyPosition =
  | Position<CfmmPool>
  | Position<WeightedPool>
  | Position<StablePool>;

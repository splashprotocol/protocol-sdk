import { Datum } from '../../../../../../core/models/Datum/Datum.ts';

export const spectrumSwapDatum = Datum.constr(0, {
  base: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  quote: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  poolNft: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  feeNum: Datum.integer(),
  feePerTokenNum: Datum.integer(),
  feePerTokenDenom: Datum.integer(),
  rewardPkh: Datum.bytes(),
  stakePkh: Datum.anyOf([
    Datum.constrAnyOf(0, [Datum.bytes()]),
    Datum.constr(1, {}),
  ]),
  baseAmount: Datum.integer(),
  minQuoteAmount: Datum.integer(),
});

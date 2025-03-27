import { Datum } from '../../../../../core/models/Datum/Datum.ts';

export const createWeightedPoolDatum = Datum.constr(0, {
  nft: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  x: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  y: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  lq: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  poolFee: Datum.integer(),
  treasuryFee: Datum.integer(),
  treasuryX: Datum.integer(),
  treasuryY: Datum.integer(),
  dao: Datum.list(
    Datum.constrAnyOf(0, [
      Datum.constr(0, {
        paymentKeyHash: Datum.bytes(),
      }),
      Datum.constr(1, {
        scriptHash: Datum.bytes(),
      }),
    ]),
  ),
  address: Datum.bytes(),
});

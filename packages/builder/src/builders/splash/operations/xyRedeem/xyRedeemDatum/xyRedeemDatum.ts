import { Datum } from '../../../../../core/models/Datum/Datum.ts';

export const xyRedeemDatum = Datum.constr(0, {
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
  exFee: Datum.integer(),
  pkh: Datum.bytes(),
  skh: Datum.anyOf([
    Datum.constrAnyOf(0, [Datum.bytes()]),
    Datum.constr(1, {}),
  ]),
});

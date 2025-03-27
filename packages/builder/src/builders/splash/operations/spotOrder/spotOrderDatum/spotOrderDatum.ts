import { Datum, InferDatum } from '../../../../../core/models/Datum/Datum.ts';

export const spotOrderDatum = Datum.constr(0, {
  type: Datum.bytes(),
  beacon: Datum.bytes(),
  inputAsset: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  inputAmount: Datum.integer(),
  costPerExStep: Datum.integer(),
  minMarginalOutput: Datum.integer(),
  outputAsset: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  price: Datum.constr(0, {
    numerator: Datum.integer(),
    denominator: Datum.integer(),
  }),
  executorFee: Datum.integer(),
  address: Datum.constr(0, {
    paymentCredentials: Datum.anyOf([
      Datum.constr(0, {
        paymentKeyHash: Datum.bytes(),
      }),
      Datum.constr(1, {
        scriptHash: Datum.bytes(),
      }),
    ]),
    stakeCredentials: Datum.anyOf([
      Datum.constrAnyOf(0, [
        Datum.constrAnyOf(0, [
          Datum.constr(0, {
            paymentKeyHash: Datum.bytes(),
          }),
          Datum.constr(1, {
            scriptHash: Datum.bytes(),
          }),
        ]),
        Datum.constr(1, {
          slotNumber: Datum.integer(),
          transactionIndex: Datum.integer(),
          certificateIndex: Datum.integer(),
        }),
      ]),
      Datum.constr(1, {}),
    ]),
  }),
  cancelPkh: Datum.bytes(),
  permittedExecutors: Datum.list(Datum.bytes()),
});

export type SpotOrderDatum = InferDatum<typeof spotOrderDatum>;

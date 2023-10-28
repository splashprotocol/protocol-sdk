import {
  BigNum,
  ConstrPlutusData,
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { Dictionary } from '../../types/types.ts';
import { DatumType } from './common/DatumType.ts';

export interface DatumPostHandler {
  readonly serialize: (pl: PlutusList) => PlutusData;
  readonly deserialize: (pd: PlutusData) => PlutusList | undefined;
}

/**
 * Default pd posthandlers
 * @type {{serialize: (pl: PlutusList) => PlutusData, deserialize: (pd: PlutusData) => PlutusList | undefined}}
 */
export const defaultDatumPostHandler: DatumPostHandler = {
  serialize: (pl: PlutusList) => PlutusData.new_list(pl),
  deserialize: (pd: PlutusData) => pd.as_list(),
};

/**
 * Spectrum pd posthandlers
 * @type {{serialize: (pl: PlutusList) => PlutusData, deserialize: (pd: PlutusData) => PlutusList | undefined}}
 */
export const spectrumDatumPostHandler: DatumPostHandler = {
  serialize: (pl: PlutusList) =>
    PlutusData.new_constr_plutus_data(ConstrPlutusData.new(BigNum.zero(), pl)),
  deserialize: (pd: PlutusData) => pd.as_constr_plutus_data()?.data(),
};

/**
 * Representation of datum
 */
export class Datum<T extends Dictionary<[number, DatumType<any>]>> {
  constructor(
    public schema: T,
    private postHandler: DatumPostHandler = defaultDatumPostHandler,
  ) {}

  serialize(value: {
    [key in keyof T]: T[key][1] extends DatumType<infer U> ? U : never;
  }): PlutusData {
    const plutusList = PlutusList.new();
    const schemaEntries = Object.entries(this.schema).sort(
      ([, aValue], [, bValue]) => aValue[0] - bValue[0],
    );

    for (const [key, [, datumType]] of schemaEntries) {
      try {
        plutusList.add(datumType.serialize(value[key]));
      } catch (e) {
        throw new Error(`Serialization error in "${key}" property. ${e}`);
      }
    }

    return this.postHandler.serialize(plutusList);
  }

  deserialize(pd: PlutusData): {
    [key in keyof T]: T[key][1] extends DatumType<infer U> ? U : never;
  } {
    const plutusList = this.postHandler.deserialize(pd);

    if (!plutusList) {
      throw new Error('Deserialization error. no list in plutus data');
    }
    const res: {
      [key in keyof T]: T[key][1] extends DatumType<infer U> ? U : never;
    } = {} as any;
    for (let i = 0; i < plutusList.len(); i++) {
      const pdItem = plutusList.get(i);
      const schemaItem = Object.entries(this.schema).find(
        ([, [pos]]) => pos === i,
      );

      if (!schemaItem) {
        throw new Error(
          `Deserialization error. No datumType for position ${i}`,
        );
      }

      const [key, [pos, datumType]] = schemaItem;
      try {
        res[key as keyof T] = datumType.deserialize(pdItem);
      } catch (e) {
        throw new Error(
          `Deserialization error in ${key} (pos ${pos}) property. ${e}`,
        );
      }
    }

    return res;
  }
}

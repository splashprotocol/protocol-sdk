import {
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { Dictionary } from '../../types/types.ts';
import { DatumType } from './common/DatumType.ts';

/**
 * Representation of datum
 */
export class Datum<T extends Dictionary<[number, DatumType<any>]>> {
  constructor(public schema: T) {}

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

    return PlutusData.new_list(plutusList);
  }

  deserialize(pd: PlutusData): {
    [key in keyof T]: T[key][1] extends DatumType<infer U> ? U : never;
  } {
    const plutusList = pd.as_list();

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

import {
  bytesToHex,
  CborHexString,
  Dictionary,
  hexToBytes,
} from '@splashprotocol/core';
import { CML } from '../../utils/Cml/Cml.ts';
import type { PlutusData } from '@dcspark/cardano-multiplatform-lib-browser';
import { DatumSerializationError } from './errors/DatumSerializationError.ts';
import { DatumDeserializationError } from './errors/DatumDeserializationError.ts';

export interface SerializationParams {
  readonly encoding: 'default' | 'cardanoNode' | 'canonical';
}

export type InferDatum<
  TItem extends
    | DatumBytes
    | DatumInteger
    | DatumConstr<any>
    | DatumList<any>
    | DatumAnyOf<any>
    | DatumConstrAnyOf<any>,
> = TItem extends DatumBytes
  ? string
  : TItem extends DatumInteger
    ? bigint
    : TItem extends DatumList<infer Field>
      ? InferDatum<Field>[]
      : TItem extends DatumAnyOf<infer Fields>
        ? InferDatum<Fields[number]>
        : TItem extends DatumConstrAnyOf<infer Fields>
          ? InferDatum<Fields[number]>
          : TItem extends DatumConstr<infer Fields>
            ? { [key in keyof Fields]: InferDatum<Fields[key]> }
            : never;

interface BaseDatumConfig<TDataType extends string> {
  readonly dataType: TDataType;
  toString(): string;
}

/* Bytes datum representation */
export class DatumBytes implements BaseDatumConfig<'bytes'> {
  dataType: 'bytes' = 'bytes';

  readonly stringType: 'hex' | 'raw' = 'hex';

  constructor(stringType: 'hex' | 'raw' = 'hex') {
    this.stringType = stringType;
  }

  async toPlutusData(data: string): Promise<PlutusData> {
    const C = await CML;

    if (!this.validate(data)) {
      throw new DatumSerializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }

    return this.stringType === 'hex'
      ? C.PlutusData.new_bytes(hexToBytes(data))
      : C.PlutusData.new_bytes(new TextEncoder().encode(data));
  }

  async serialize(
    data: string,
    params: SerializationParams = {
      encoding: 'default',
    },
  ): Promise<CborHexString> {
    if (!this.validate(data)) {
      throw new DatumSerializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }

    let pd = await this.toPlutusData(data);

    switch (params.encoding) {
      case 'canonical':
        return pd.to_canonical_cbor_hex();
      case 'cardanoNode':
        return pd.to_cardano_node_format().to_cbor_hex();
      case 'default':
        return pd.to_cbor_hex();
    }
  }

  async deserialize(cbor: CborHexString): Promise<string> {
    const C = await CML;

    if (!(await this.validateCbor(cbor))) {
      throw new DatumDeserializationError(
        `invalid data for ${this.toString()} deserialization`,
      );
    }

    if (this.stringType === 'hex') {
      return bytesToHex(C.PlutusData.from_cbor_hex(cbor).as_bytes()!);
    } else {
      return new TextDecoder().decode(
        C.PlutusData.from_cbor_hex(cbor).as_bytes()!,
      );
    }
  }

  validate(data: any): data is string {
    return typeof data === 'string';
  }

  async validateCbor(cbor: CborHexString): Promise<boolean> {
    const C = await CML;

    return !!C.PlutusData.from_cbor_hex(cbor).as_bytes();
  }

  toString(): string {
    return this.dataType;
  }
}
/* Bytes datum representation end */

/* Integer datum representation */
export class DatumInteger implements BaseDatumConfig<'integer'> {
  dataType: 'integer' = 'integer';

  async toPlutusData(data: bigint): Promise<PlutusData> {
    const C = await CML;

    return C.PlutusData.new_integer(C.BigInteger.from_str(data.toString()));
  }

  async serialize(
    data: bigint,
    params: SerializationParams = {
      encoding: 'default',
    },
  ): Promise<CborHexString> {
    if (!this.validate(data)) {
      throw new DatumSerializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }

    const pd = await this.toPlutusData(data);

    switch (params.encoding) {
      case 'canonical':
        return pd.to_canonical_cbor_hex();
      case 'cardanoNode':
        return pd.to_cardano_node_format().to_cbor_hex();
      case 'default':
        return pd.to_cbor_hex();
    }
  }

  async deserialize(cbor: CborHexString): Promise<bigint> {
    const C = await CML;

    if (!(await this.validateCbor(cbor))) {
      throw new DatumDeserializationError(
        `invalid data for ${this.toString()} deserialization`,
      );
    }

    return BigInt(C.PlutusData.from_cbor_hex(cbor).as_integer()!.to_str());
  }

  validate(data: any): data is bigint {
    return typeof data === 'bigint';
  }

  async validateCbor(cbor: CborHexString): Promise<boolean> {
    const C = await CML;

    return !!C.PlutusData.from_cbor_hex(cbor).as_integer();
  }

  toString(): string {
    return this.dataType;
  }
}
/* Integer datum representation end */

/* any of constructor datum representation */
export class DatumConstrAnyOf<
  T extends (
    | DatumBytes
    | DatumInteger
    | DatumConstr<any>
    | DatumList<any>
    | DatumConstrAnyOf<any>
  )[],
> implements BaseDatumConfig<'anyOfConstructor'>
{
  readonly dataType: 'anyOfConstructor' = 'anyOfConstructor';

  readonly index: number;

  readonly anyOfConstructor: T;

  constructor(index: number, anyOfConstructor: T) {
    this.index = index;
    this.anyOfConstructor = anyOfConstructor;
  }

  async toPlutusData(
    data: T extends Array<infer D>
      ? D extends
          | DatumBytes
          | DatumInteger
          | DatumConstr<any>
          | DatumList<any>
          | DatumConstrAnyOf<any>
        ? InferDatum<D>
        : never
      : never,
  ): Promise<PlutusData> {
    const C = await CML;
    const plutusDataList = C.PlutusDataList.new();
    const serializer = this.anyOfConstructor.find((item) =>
      //@ts-ignore
      item.validate(data),
    );

    plutusDataList.add(await serializer!.toPlutusData(data));

    return C.PlutusData.new_constr_plutus_data(
      C.ConstrPlutusData.new(BigInt(this.index), plutusDataList),
    );
  }

  async serialize(
    data: T extends Array<infer D>
      ? D extends
          | DatumBytes
          | DatumInteger
          | DatumConstr<any>
          | DatumList<any>
          | DatumConstrAnyOf<any>
        ? InferDatum<D>
        : never
      : never,
    params: SerializationParams = {
      encoding: 'default',
    },
  ): Promise<CborHexString> {
    //@ts-ignore
    if (!this.validate(data)) {
      throw new DatumSerializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }

    const pd = await this.toPlutusData(data);

    switch (params.encoding) {
      case 'canonical':
        return pd.to_canonical_cbor_hex();
      case 'cardanoNode':
        return pd.to_cardano_node_format().to_cbor_hex();
      case 'default':
        return pd.to_cbor_hex();
    }
  }

  async deserialize(
    cbor: CborHexString,
  ): Promise<
    T extends Array<infer D>
      ? D extends
          | DatumBytes
          | DatumInteger
          | DatumConstr<any>
          | DatumList<any>
          | DatumConstrAnyOf<any>
        ? InferDatum<D>
        : never
      : never
  > {
    if (!(await this.validateCbor(cbor))) {
      throw new DatumDeserializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }
    const C = await CML;
    const constr = C.PlutusData.from_cbor_hex(cbor).as_constr_plutus_data()!;
    const field = constr.fields().get(0);

    for (let i = 0; i < this.anyOfConstructor.length; i++) {
      const isValidForItem = await this.anyOfConstructor[i].validateCbor(
        field.to_cbor_hex(),
      );
      if (isValidForItem) {
        return (await this.anyOfConstructor[i].deserialize(
          field.to_cbor_hex(),
        )) as any;
      }
    }

    throw new DatumDeserializationError('unreachable');
  }

  validate(
    data: any,
  ): data is T extends Array<infer D>
    ? D extends
        | DatumBytes
        | DatumInteger
        | DatumConstr<any>
        | DatumList<any>
        | DatumConstrAnyOf<any>
      ? InferDatum<D>
      : never
    : never {
    return this.anyOfConstructor.some((datumConfig) =>
      //@ts-ignore
      datumConfig.validate(data),
    );
  }

  async validateCbor(cbor: CborHexString): Promise<boolean> {
    const C = await CML;
    const constr = C.PlutusData.from_cbor_hex(cbor).as_constr_plutus_data();

    if (!constr) {
      return false;
    }
    if (constr.alternative() !== BigInt(this.index)) {
      return false;
    }
    const field = constr.fields().get(0);

    for (let i = 0; i < this.anyOfConstructor.length; i++) {
      const isValidForItem = await this.anyOfConstructor[i].validateCbor(
        field.to_cbor_hex(),
      );
      if (isValidForItem) {
        return true;
      }
    }
    return false;
  }

  toString(): string {
    return `${this.dataType}: \n| ${this.anyOfConstructor.map((item) => item.toString()).join('\n| ')}`;
  }
}
/* any of constructor datum representation end */

/* any of datum representation */
export class DatumAnyOf<
  T extends (
    | DatumBytes
    | DatumInteger
    | DatumConstr<any>
    | DatumList<any>
    | DatumConstrAnyOf<any>
  )[],
> implements BaseDatumConfig<'anyOf'>
{
  readonly dataType: 'anyOf' = 'anyOf';

  readonly anyOf: T;

  constructor(anyOf: T) {
    this.anyOf = anyOf;
  }

  async toPlutusData(
    data: T extends Array<infer D>
      ? D extends
          | DatumBytes
          | DatumInteger
          | DatumConstr<any>
          | DatumList<any>
          | DatumConstrAnyOf<any>
        ? InferDatum<D>
        : never
      : never,
  ): Promise<PlutusData> {
    const serializer = this.anyOf.find((item) =>
      //@ts-ignore
      item.validate(data),
    );

    return serializer!.toPlutusData(data);
  }

  async serialize(
    data: T extends Array<infer D>
      ? D extends
          | DatumBytes
          | DatumInteger
          | DatumConstr<any>
          | DatumList<any>
          | DatumConstrAnyOf<any>
        ? InferDatum<D>
        : never
      : never,
    params: SerializationParams = {
      encoding: 'default',
    },
  ): Promise<CborHexString> {
    if (!this.validate(data)) {
      throw new DatumSerializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }

    const pd = await this.toPlutusData(data);

    switch (params.encoding) {
      case 'canonical':
        return pd.to_canonical_cbor_hex();
      case 'cardanoNode':
        return pd.to_cardano_node_format().to_cbor_hex();
      case 'default':
        return pd.to_cbor_hex();
    }
  }

  async deserialize(
    cbor: CborHexString,
  ): Promise<
    T extends Array<infer D>
      ? D extends
          | DatumBytes
          | DatumInteger
          | DatumConstr<any>
          | DatumList<any>
          | DatumConstrAnyOf<any>
        ? InferDatum<D>
        : never
      : never
  > {
    if (!(await this.validateCbor(cbor))) {
      throw new DatumDeserializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }
    for (let i = 0; i < this.anyOf.length; i++) {
      const isValidForItem = await this.anyOf[i].validateCbor(cbor);
      if (isValidForItem) {
        return (await this.anyOf[i].deserialize(cbor)) as any;
      }
    }
    throw new DatumDeserializationError('unreachable');
  }

  validate(
    data: any,
  ): data is T extends Array<infer D>
    ? D extends
        | DatumBytes
        | DatumInteger
        | DatumConstr<any>
        | DatumList<any>
        | DatumConstrAnyOf<any>
      ? InferDatum<D>
      : never
    : never {
    return this.anyOf.some((datumConfig) =>
      //@ts-ignore
      datumConfig.validate(data),
    );
  }

  async validateCbor(cbor: CborHexString): Promise<boolean> {
    for (let i = 0; i < this.anyOf.length; i++) {
      const isValidForItem = await this.anyOf[i].validateCbor(cbor);
      if (isValidForItem) {
        return true;
      }
    }
    return false;
  }

  toString(): string {
    return `${this.dataType}: \n| ${this.anyOf.map((item) => item.toString()).join('\n| ')}`;
  }
}
/* any of datum representation end */

/* list datum representation */
export class DatumList<
  T extends
    | DatumBytes
    | DatumInteger
    | DatumConstr<any>
    | DatumList<any>
    | DatumAnyOf<any>
    | DatumConstrAnyOf<any>,
> implements BaseDatumConfig<'list'>
{
  readonly dataType: 'list' = 'list';

  readonly items: T;

  constructor(items: T) {
    this.items = items;
  }

  async toPlutusData(data: InferDatum<T>[]): Promise<PlutusData> {
    const C = await CML;
    const plutusList = C.PlutusDataList.new();

    for (let i = 0; i < data.length; i++) {
      plutusList.add(
        //@ts-ignore
        await this.items.toPlutusData(data[i]),
      );
    }

    return C.PlutusData.new_list(plutusList);
  }

  async serialize(
    data: InferDatum<T>[],
    params: SerializationParams = {
      encoding: 'default',
    },
  ): Promise<CborHexString> {
    if (!this.validate(data)) {
      throw new DatumSerializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }

    const pd = await this.toPlutusData(data);

    switch (params.encoding) {
      case 'canonical':
        return pd.to_canonical_cbor_hex();
      case 'cardanoNode':
        return pd.to_cardano_node_format().to_cbor_hex();
      case 'default':
        return pd.to_cbor_hex();
    }
  }

  async deserialize(cbor: CborHexString): Promise<InferDatum<T>[]> {
    if (!(await this.validateCbor(cbor))) {
      throw new DatumDeserializationError(
        `invalid data for ${this.toString()} deserialization`,
      );
    }

    const C = await CML;
    const plutusList = C.PlutusData.from_cbor_hex(cbor).as_list()!;
    const res: any[] = [];

    for (let i = 0; i < plutusList.len(); i++) {
      res.push(await this.items.deserialize(plutusList.get(i).to_cbor_hex()));
    }

    return res;
  }

  validate(data: any): data is InferDatum<T>[] {
    if (data instanceof Array) {
      // @ts-ignore
      return data.every((dataItem) => this.items.validate(dataItem));
    }
    return false;
  }

  async validateCbor(cbor: CborHexString): Promise<boolean> {
    const C = await CML;

    const list = C.PlutusData.from_cbor_hex(cbor).as_list();

    if (!list) {
      return false;
    }
    for (let i = 0; i < list.len(); i++) {
      const isItemValid = await this.items.validateCbor(
        list.get(i).to_cbor_hex(),
      );

      if (!isItemValid) {
        return false;
      }
    }
    return true;
  }

  toString(): string {
    return `${this.dataType}: [\n${this.items.toString()}\n]`;
  }
}
/* list datum representation end */

/* constructor datum representation */
export class DatumConstr<
  T extends {
    [key: string]:
      | DatumBytes
      | DatumInteger
      | DatumConstr<any>
      | DatumList<any>
      | DatumAnyOf<any>
      | DatumConstrAnyOf<any>;
  },
> implements BaseDatumConfig<'constructor'>
{
  readonly dataType: 'constructor' = 'constructor';

  readonly index: number;

  readonly fields: T;

  constructor(index: number, fields: T) {
    this.index = index;
    this.fields = fields;
  }

  async toPlutusData(data: {
    [key in keyof T]: InferDatum<T[key]>;
  }): Promise<PlutusData> {
    const C = await CML;
    const plutusList = C.PlutusDataList.new();

    const fieldsArray = Object.entries(this.fields);

    for (let i = 0; i < fieldsArray.length; i++) {
      //@ts-ignore
      const serializedData = await fieldsArray[i][1].toPlutusData(
        //@ts-ignore
        data[fieldsArray[i][0]],
      );
      plutusList.add(
        //   @ts-ignore
        serializedData,
      );
    }
    return C.PlutusData.new_constr_plutus_data(
      C.ConstrPlutusData.new(BigInt(this.index), plutusList),
    );
  }

  async serialize(
    data: {
      [key in keyof T]: InferDatum<T[key]>;
    },
    params: SerializationParams = {
      encoding: 'default',
    },
  ): Promise<CborHexString> {
    if (!this.validate(data)) {
      throw new DatumSerializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }
    const pd = await this.toPlutusData(data);

    switch (params.encoding) {
      case 'canonical':
        return pd.to_canonical_cbor_hex();
      case 'cardanoNode':
        return pd.to_cardano_node_format().to_cbor_hex();
      case 'default':
        return pd.to_cbor_hex();
    }
  }

  async deserialize(cbor: CborHexString): Promise<{
    [key in keyof T]: InferDatum<T[key]>;
  }> {
    if (!(await this.validateCbor(cbor))) {
      throw new DatumDeserializationError(
        `invalid data for ${this.toString()} serialization`,
      );
    }

    const C = await CML;
    const plutusConstr =
      C.PlutusData.from_cbor_hex(cbor).as_constr_plutus_data()!;
    const fieldsArray = Object.entries(this.fields);
    const cborFields = plutusConstr.fields();
    const res: Dictionary<any> = {};

    for (let i = 0; i < cborFields.len(); i++) {
      res[fieldsArray[i][0] as unknown as string] = await fieldsArray[
        i
      ][1].deserialize(cborFields.get(i).to_cbor_hex());
    }

    return res as any;
  }

  validate(data: any): data is {
    [key in keyof T]: InferDatum<T[key]>;
  } {
    return Object.entries(this.fields).every(([fieldKey, datumConfig]) =>
      // @ts-ignore
      datumConfig.validate(data[fieldKey]),
    );
  }

  async validateCbor(cbor: CborHexString): Promise<boolean> {
    const C = await CML;
    const plutusConstr =
      C.PlutusData.from_cbor_hex(cbor).as_constr_plutus_data();

    if (!plutusConstr) {
      return false;
    }
    if (plutusConstr.alternative() !== BigInt(this.index)) {
      return false;
    }
    const fieldsArray = Object.values(this.fields);
    const cborFields = plutusConstr.fields();

    for (let i = 0; i < cborFields.len(); i++) {
      const itemValidation = await fieldsArray[i].validateCbor(
        cborFields.get(i).to_cbor_hex(),
      );
      if (!itemValidation) {
        return false;
      }
    }

    return true;
  }

  toString(): string {
    return `${this.dataType}: {\n${Object.entries(this.fields)
      .map(
        ([fieldKey, datumConfig]) => `${fieldKey}: ${datumConfig.toString()}`,
      )
      .join(',\n')}\n}`;
  }
}
/* constructor datum representation end */

export const Datum = {
  constr<
    T extends {
      [key: string]:
        | DatumBytes
        | DatumInteger
        | DatumConstr<any>
        | DatumList<any>
        | DatumAnyOf<any>
        | DatumConstrAnyOf<any>;
    },
  >(index: number, fields: T): DatumConstr<T> {
    return new DatumConstr(index, fields);
  },

  list<
    T extends
      | DatumBytes
      | DatumInteger
      | DatumConstr<any>
      | DatumList<any>
      | DatumAnyOf<any>
      | DatumConstrAnyOf<any>,
  >(items: T): DatumList<T> {
    return new DatumList(items);
  },

  bytes(stringType: 'hex' | 'raw' = 'hex'): DatumBytes {
    return new DatumBytes(stringType);
  },

  integer(): DatumInteger {
    return new DatumInteger();
  },

  anyOf<
    T extends (
      | DatumBytes
      | DatumInteger
      | DatumConstr<any>
      | DatumList<any>
      | DatumConstrAnyOf<any>
    )[],
  >(anyOf: T): DatumAnyOf<T> {
    return new DatumAnyOf(anyOf);
  },

  constrAnyOf<
    T extends (
      | DatumBytes
      | DatumInteger
      | DatumConstr<any>
      | DatumList<any>
      | DatumConstrAnyOf<any>
    )[],
  >(index: number, anyOfConstructor: T): DatumConstrAnyOf<T> {
    return new DatumConstrAnyOf(index, anyOfConstructor);
  },
};

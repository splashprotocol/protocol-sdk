import {
  PlutusData,
  PlutusList,
} from '@emurgo/cardano-serialization-lib-browser';

import { SpectrumBigIntDatumType } from '../SpectrumBigIntDatumType/SpectrumBigIntDatumType.ts';
import { SpectrumDatumListType } from './SpectrumDatumListType.ts';

test('it should serialises list of bigint', () => {
  const expectedDatumList = PlutusList.new();
  expectedDatumList.add(SpectrumBigIntDatumType.serialize(1n));
  expectedDatumList.add(SpectrumBigIntDatumType.serialize(2n));
  expectedDatumList.add(SpectrumBigIntDatumType.serialize(3n));
  const expectedDatum = PlutusData.new_list(expectedDatumList);

  expect(
    SpectrumDatumListType(SpectrumBigIntDatumType)
      .serialize([1n, 2n, 3n])
      .to_hex(),
  ).toBe(expectedDatum.to_hex());
});

test('it should deserializes datum list representation to bigint[]', () => {
  const expectedBigintList = [1n, 2n, 3n];
  const datumList = PlutusList.new();
  datumList.add(SpectrumBigIntDatumType.serialize(1n));
  datumList.add(SpectrumBigIntDatumType.serialize(2n));
  datumList.add(SpectrumBigIntDatumType.serialize(3n));
  const datum = PlutusData.new_list(datumList);

  expect(
    SpectrumDatumListType(SpectrumBigIntDatumType).deserialize(datum),
  ).toEqual(expectedBigintList);
});

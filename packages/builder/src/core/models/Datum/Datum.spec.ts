import { Datum } from './Datum.ts';
import { AssetInfo } from '@splashprotocol/core';

test('it should validate and serialize string data', async () => {
  expect(Datum.bytes().validate('string')).toBe(true);
  expect(Datum.bytes().validate(1)).toBe(false);

  expect(await Datum.bytes().serialize(AssetInfo.spf.nameBase16)).toBe(
    AssetInfo.spf.nameCbor,
  );
  // expect(await Datum.bytes().deserialize(AssetInfo.spf.nameCbor)).toBe(
  //   AssetInfo.spf.nameBase16,
  // );
});

test('it should validate and deserialize string cbor', async () => {
  expect(await Datum.bytes().validateCbor(AssetInfo.spf.nameCbor)).toBe(true);
  expect(await Datum.bytes().validateCbor('1864')).toBe(false);

  expect(await Datum.bytes().deserialize(AssetInfo.spf.nameCbor)).toBe(
    AssetInfo.spf.nameBase16,
  );
  try {
    expect(await Datum.bytes().deserialize('1864')).toBe(
      AssetInfo.spf.nameBase16,
    );
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and serialize number data', async () => {
  expect(Datum.integer().validate(1n)).toBe(true);
  expect(Datum.integer().validate(1)).toBe(false);

  expect(await Datum.integer().serialize(100n)).toBe('1864');
  // expect(await Datum.integer().deserialize('1864')).toBe(100n);
});

test('it should validate and deserialize number cbor', async () => {
  expect(await Datum.integer().validateCbor('1864')).toBe(true);
  expect(await Datum.integer().validateCbor(AssetInfo.spf.nameCbor)).toBe(
    false,
  );

  expect(await Datum.integer().deserialize('1864')).toBe(100n);
  try {
    await Datum.integer().deserialize(AssetInfo.spf.nameCbor);
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and serialize number list', async () => {
  const numberList = Datum.list(Datum.integer());

  expect(numberList.validate([1])).toBe(false);
  expect(numberList.validate(['123'])).toBe(false);
  expect(numberList.validate('456')).toBe(false);
  expect(numberList.validate([1n])).toBe(true);

  expect(await numberList.serialize([1n])).toBe('8101');
  try {
    await numberList.serialize([true as any]);
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and deserialize number list cbor', async () => {
  const numberList = Datum.list(Datum.integer());

  expect(await numberList.validateCbor(AssetInfo.spf.nameCbor)).toBe(false);
  expect(await numberList.validateCbor('1864')).toBe(false);
  expect(await numberList.validateCbor('8143535046')).toBe(false);
  expect(await numberList.validateCbor('8101')).toBe(true);

  const bigintArray = await numberList.deserialize('8101');
  expect(bigintArray).toBeInstanceOf(Array);
  expect(bigintArray[0]).toBe(1n);

  try {
    await numberList.deserialize('1864');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
  try {
    await numberList.deserialize('8143535046');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and serialize string list', async () => {
  const stringList = Datum.list(Datum.bytes());

  expect(stringList.validate([1])).toBe(false);
  expect(stringList.validate([AssetInfo.spf.nameBase16])).toBe(true);
  expect(stringList.validate('456')).toBe(false);
  expect(stringList.validate([1n])).toBe(false);

  expect(await stringList.serialize([AssetInfo.spf.nameBase16])).toBe(
    '8143535046',
  );
  try {
    await stringList.serialize([true as any]);
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and deserialize string list cbor', async () => {
  const stringList = Datum.list(Datum.bytes());

  expect(await stringList.validateCbor(AssetInfo.spf.nameCbor)).toBe(false);
  expect(await stringList.validateCbor('1864')).toBe(false);
  expect(await stringList.validateCbor('8143535046')).toBe(true);
  expect(await stringList.validateCbor('8101')).toBe(false);

  const stringArray = await stringList.deserialize('8143535046');
  expect(stringArray).toBeInstanceOf(Array);
  expect(stringArray[0]).toBe(AssetInfo.spf.nameBase16);

  try {
    await stringList.deserialize('1864');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
  try {
    await stringList.deserialize('8101');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and serialize object list', async () => {
  const objectList = Datum.list(
    Datum.constr(0, {
      asset: Datum.bytes(),
      amount: Datum.integer(),
    }),
  );

  expect(objectList.validate([1])).toBe(false);
  expect(objectList.validate([AssetInfo.spf.nameBase16])).toBe(false);
  expect(objectList.validate('456')).toBe(false);
  expect(objectList.validate([1n])).toBe(false);
  expect(
    objectList.validate([{ asset: AssetInfo.spf.nameBase16, amount: 100n }]),
  ).toBe(true);

  expect(await objectList.serialize([])).toBe('80');
  expect(
    await objectList.serialize([
      { asset: AssetInfo.spf.nameBase16, amount: 100n },
    ]),
  ).toBe('81d87982435350461864');

  try {
    await objectList.serialize([1 as any]);
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and deserialize object list cbor', async () => {
  const objectList = Datum.list(
    Datum.constr(0, {
      asset: Datum.bytes(),
      amount: Datum.integer(),
    }),
  );

  expect(await objectList.validateCbor(AssetInfo.spf.nameCbor)).toBe(false);
  expect(await objectList.validateCbor('1864')).toBe(false);
  expect(await objectList.validateCbor('8143535046')).toBe(false);
  expect(await objectList.validateCbor('8101')).toBe(false);
  expect(await objectList.validateCbor('81d87982435350461864')).toBe(true);

  const objectArray = await objectList.deserialize('81d87982435350461864');
  expect(objectArray).toBeInstanceOf(Array);
  expect(objectArray[0].amount).toBe(100n);
  expect(objectArray[0].asset).toBe(AssetInfo.spf.nameBase16);

  try {
    await objectList.deserialize('1864');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and serialize object ', async () => {
  const constr = Datum.constr(0, {
    asset: Datum.bytes(),
    amount: Datum.integer(),
  });

  expect(
    constr.validate({ asset: AssetInfo.spf.nameBase16, amount: 100n }),
  ).toBe(true);
  expect(constr.validate({ asset: AssetInfo.spf.nameBase16, amount: '' })).toBe(
    false,
  );
  expect(constr.validate('123')).toBe(false);
  expect(
    await constr.serialize({ asset: AssetInfo.spf.nameBase16, amount: 100n }),
  ).toBe('d87982435350461864');

  try {
    await constr.serialize({
      asset: AssetInfo.spf.nameBase16,
      amount: ['1'] as any,
    });
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should validate and deserialize object ', async () => {
  const constr = Datum.constr(0, {
    asset: Datum.bytes(),
    amount: Datum.integer(),
  });

  expect(await constr.validateCbor(AssetInfo.spf.nameCbor)).toBe(false);
  expect(await constr.validateCbor('1864')).toBe(false);
  expect(await constr.validateCbor('8143535046')).toBe(false);
  expect(await constr.validateCbor('8101')).toBe(false);
  expect(await constr.validateCbor('81d87982435350461864')).toBe(false);
  expect(await constr.validateCbor('d87982435350461864')).toBe(true);

  const obj = await constr.deserialize('d87982435350461864');

  expect(obj.amount).toBe(100n);
  expect(obj.asset).toBe(AssetInfo.spf.nameBase16);

  try {
    await constr.deserialize('81d87982435350461864');
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should use correct serialization for enum item', async () => {
  const enumDatum = Datum.constrAnyOf(0, [
    Datum.constr(0, {
      test: Datum.integer(),
    }),
    Datum.constr(1, {
      test2: Datum.bytes(),
    }),
  ]);

  expect(enumDatum.validate('')).toBe(false);
  expect(enumDatum.validate(1)).toBe(false);
  expect(enumDatum.validate(1n)).toBe(false);
  expect(enumDatum.validate({ test: 1n })).toBe(true);
  expect(enumDatum.validate({ test2: AssetInfo.spf.nameBase16 })).toBe(true);

  expect(await enumDatum.serialize({ test: 1n })).toBe('d87981d8798101');
  expect(await enumDatum.serialize({ test2: AssetInfo.spf.nameBase16 })).toBe(
    'd87981d87a8143535046',
  );
  try {
    await enumDatum.serialize(1n as any);
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should use correct deserialization for enum item', async () => {
  const enumDatum = Datum.constrAnyOf(0, [
    Datum.constr(0, {
      test: Datum.integer(),
    }),
    Datum.constr(1, {
      test2: Datum.bytes(),
    }),
  ]);

  expect(await enumDatum.validateCbor('d87982435350461864')).toBe(false);
  expect(await enumDatum.validateCbor('d87981d8798101')).toBe(true);
  expect(await enumDatum.validateCbor('d87981d87a8143535046')).toBe(true);
  expect(await enumDatum.validateCbor('8101')).toBe(false);

  const firstItem = await enumDatum.deserialize('d87981d8798101');

  expect(firstItem).toBeInstanceOf(Object);
  expect((<any>firstItem).test).toBe(1n);

  const secondItem = await enumDatum.deserialize('d87981d87a8143535046');
  expect(secondItem).toBeInstanceOf(Object);
  expect((<any>secondItem).test2).toBe(AssetInfo.spf.nameBase16);
});

test('it should use correct serialization for anyOf item', async () => {
  const enumDatum = Datum.anyOf([
    Datum.constr(0, {
      test: Datum.integer(),
    }),
    Datum.constr(1, {
      test2: Datum.bytes(),
    }),
  ]);

  expect(enumDatum.validate('')).toBe(false);
  expect(enumDatum.validate(1)).toBe(false);
  expect(enumDatum.validate(1n)).toBe(false);
  expect(enumDatum.validate({ test: 1n })).toBe(true);
  expect(enumDatum.validate({ test2: AssetInfo.spf.nameBase16 })).toBe(true);

  expect(await enumDatum.serialize({ test: 1n })).toBe('d8798101');
  expect(await enumDatum.serialize({ test2: AssetInfo.spf.nameBase16 })).toBe(
    'd87a8143535046',
  );
  try {
    await enumDatum.serialize(1n as any);
  } catch (e) {
    expect(e).toBeInstanceOf(Error);
  }
});

test('it should use correct deserialization for anyOf item', async () => {
  const enumDatum = Datum.anyOf([
    Datum.constr(0, {
      test: Datum.integer(),
    }),
    Datum.constr(1, {
      test2: Datum.bytes(),
    }),
  ]);

  expect(await enumDatum.validateCbor('d87982435350461864')).toBe(false);
  expect(await enumDatum.validateCbor('d8798101')).toBe(true);
  expect(await enumDatum.validateCbor('d87a8143535046')).toBe(true);
  expect(await enumDatum.validateCbor('8101')).toBe(false);

  const firstItem = await enumDatum.deserialize('d8798101');
  //
  expect(firstItem).toBeInstanceOf(Object);
  expect((<any>firstItem).test).toBe(1n);

  const secondItem = await enumDatum.deserialize('d87a8143535046');
  expect(secondItem).toBeInstanceOf(Object);
  expect((<any>secondItem).test2).toBe(AssetInfo.spf.nameBase16);
});

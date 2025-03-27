import { AssetNameCbor } from './AssetNameCbor.ts';
import { hexToString } from '../../encoding/hexToString/hexToString.ts';

const adaRaw = '';
const adaHex = '';
const adaCborHex = '40';
const adaCborBytes = [64];

const spfRaw = 'SPF';
const spfHex = '535046';
const spfCborHex = '43535046';
const spfCborBytes = [67, 83, 80, 70];

const stableHex = '535441424c45';
const stableRaw = 'STABLE';
const stableCborHex = '46535441424c45';
const stableCborBytes = [70, 83, 84, 65, 66, 76, 69];

const gensHex = '0014df1047454e53';
const gensRaw = hexToString(gensHex);
const gensCborHex = '480014df1047454e53';
const gensCborBytes = [72, 0, 20, 223, 16, 71, 69, 78, 83];

test('it should convert ada to ada cbor bytes, hex', () => {
  expect(Array.from(AssetNameCbor.encodeHexToCborBytes(adaHex))).toEqual(
    adaCborBytes,
  );
  expect(Array.from(AssetNameCbor.encodeStringToCborBytes(adaRaw))).toEqual(
    adaCborBytes,
  );
  expect(AssetNameCbor.encodeHexToCborHex(adaHex)).toEqual(adaCborHex);
  expect(AssetNameCbor.encodeStringToCborHex(adaRaw)).toEqual(adaCborHex);
});

test('it should convert ada cbor bytes, hex to ada hex, name', () => {
  expect(AssetNameCbor.decodeCborBytesToHex(Buffer.from(adaCborBytes))).toEqual(
    adaHex,
  );
  expect(
    AssetNameCbor.decodeCborBytesToString(Buffer.from(adaCborBytes)),
  ).toEqual(adaRaw);
  expect(AssetNameCbor.decodeCborHexToHex(adaCborHex)).toEqual(adaHex);
  expect(AssetNameCbor.decodeCborHexToString(adaCborHex)).toEqual(adaRaw);
});

test('it should convert spf to spf cbor bytes, hex', () => {
  expect(Array.from(AssetNameCbor.encodeHexToCborBytes(spfHex))).toEqual(
    spfCborBytes,
  );
  expect(Array.from(AssetNameCbor.encodeStringToCborBytes(spfRaw))).toEqual(
    spfCborBytes,
  );
  expect(AssetNameCbor.encodeHexToCborHex(spfHex)).toEqual(spfCborHex);
  expect(AssetNameCbor.encodeStringToCborHex(spfRaw)).toEqual(spfCborHex);
});

test('it should convert spf cbor bytes, hex to ada hex, name', () => {
  expect(AssetNameCbor.decodeCborBytesToHex(Buffer.from(spfCborBytes))).toEqual(
    spfHex,
  );
  expect(
    AssetNameCbor.decodeCborBytesToString(Buffer.from(spfCborBytes)),
  ).toEqual(spfRaw);
  expect(AssetNameCbor.decodeCborHexToHex(spfCborHex)).toEqual(spfHex);
  expect(AssetNameCbor.decodeCborHexToString(spfCborHex)).toEqual(spfRaw);
});

test('it should convert STABLE to STABLE cbor bytes, hex', () => {
  expect(Array.from(AssetNameCbor.encodeHexToCborBytes(stableHex))).toEqual(
    stableCborBytes,
  );
  expect(Array.from(AssetNameCbor.encodeStringToCborBytes(stableRaw))).toEqual(
    stableCborBytes,
  );
  expect(AssetNameCbor.encodeHexToCborHex(stableHex)).toEqual(stableCborHex);
  expect(AssetNameCbor.encodeStringToCborHex(stableRaw)).toEqual(stableCborHex);
});

test('it should convert STABLE cbor bytes, hex to ada hex, name', () => {
  expect(
    AssetNameCbor.decodeCborBytesToHex(Buffer.from(stableCborBytes)),
  ).toEqual(stableHex);
  expect(
    AssetNameCbor.decodeCborBytesToString(Buffer.from(stableCborBytes)),
  ).toEqual(stableRaw);
  expect(AssetNameCbor.decodeCborHexToHex(stableCborHex)).toEqual(stableHex);
  expect(AssetNameCbor.decodeCborHexToString(stableCborHex)).toEqual(stableRaw);
});

test('it should convert gens to gens cbor bytes, hex', () => {
  expect(Array.from(AssetNameCbor.encodeHexToCborBytes(gensHex))).toEqual(
    gensCborBytes,
  );
  expect(Array.from(AssetNameCbor.encodeStringToCborBytes(gensRaw))).toEqual(
    gensCborBytes,
  );
  expect(AssetNameCbor.encodeHexToCborHex(gensHex)).toEqual(gensCborHex);
  expect(AssetNameCbor.encodeStringToCborHex(gensRaw)).toEqual(gensCborHex);
});

test('it should convert gens cbor bytes, hex to ada hex, name', () => {
  expect(
    AssetNameCbor.decodeCborBytesToHex(Buffer.from(gensCborBytes)),
  ).toEqual(gensHex);
  expect(
    AssetNameCbor.decodeCborBytesToString(Buffer.from(gensCborBytes)),
  ).toEqual(gensRaw);
  expect(AssetNameCbor.decodeCborHexToHex(gensCborHex)).toEqual(gensHex);
  expect(AssetNameCbor.decodeCborHexToString(gensCborHex)).toEqual(gensRaw);
});

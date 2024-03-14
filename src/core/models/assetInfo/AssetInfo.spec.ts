import {
  AssetName,
  ScriptHash,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { stringToHex } from '../../utils/stringToHex/stringToHex.ts';
import { AssetInfo } from './AssetInfo.ts';

const assetPolicyId =
  '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
const assetName = 'SPF';
const assetInfoWithoutMetadata = AssetInfo.new({
  name: assetName,
  policyId: assetPolicyId,
  type: 'raw',
});
const assetInfoWithMetadata = AssetInfo.new(
  {
    name: assetName,
    policyId: assetPolicyId,
    type: 'raw',
  },
  {
    name: assetName,
    policyId: assetPolicyId,
    ticker: 'Ticker',
    description: 'spectrum finance token',
    url: 'https://spectrum.fi',
    decimals: 6,
    logo: 'https://logo.url',
  },
);

test('it should create valid asset info instance from name', () => {
  expect(assetInfoWithoutMetadata).toBeInstanceOf(AssetInfo);
});

test('it should returns valid asset name', () => {
  expect(assetInfoWithoutMetadata.name).toBe(assetName);
});

test('it should returns valid asset name hex', () => {
  expect(assetInfoWithoutMetadata.nameBase16).toBe('535046');
});

test('it should returns valid asset name cbor hex', () => {
  expect(assetInfoWithoutMetadata.nameCbor).toBe('43535046');
});

test('it should returns valid asset name wasm instance', () => {
  expect(assetInfoWithoutMetadata.wasmName).toBeInstanceOf(AssetName);
  expect(assetInfoWithoutMetadata.wasmName.to_cbor_hex()).toBe('43535046');
});

test('it should returns valid script hash wasm instance', () => {
  expect(assetInfoWithoutMetadata.wasmPolicyId).toBeInstanceOf(ScriptHash);
  expect(assetInfoWithoutMetadata.wasmPolicyId.to_hex()).toBe(assetPolicyId);
});

test('it should returns valid policy id', () => {
  expect(assetInfoWithoutMetadata.policyId).toBe(assetPolicyId);
});

test('it should returns valid spectrum Id', () => {
  expect(assetInfoWithoutMetadata.splashId).toBe(
    `${assetPolicyId}.${stringToHex(assetName)}`,
  );
});

test('it should returns valid asset subject', () => {
  expect(assetInfoWithoutMetadata.subject).toBe(
    `${assetPolicyId}${stringToHex(assetName)}`,
  );
});

test('it should returns asset decimals count', () => {
  expect(assetInfoWithoutMetadata.decimals).toBe(0);
  expect(assetInfoWithMetadata.decimals).toBe(6);
});

test('it should returns asset description', () => {
  expect(assetInfoWithoutMetadata.description).toBe(undefined);
  expect(assetInfoWithMetadata.description).toBe('spectrum finance token');
});

test('it should returns asset url', () => {
  expect(assetInfoWithoutMetadata.url).toBe(undefined);
  expect(assetInfoWithMetadata.url).toBe('https://spectrum.fi');
});

test('it should returns asset ticker', () => {
  expect(assetInfoWithoutMetadata.ticker).toBe(assetName);
  expect(assetInfoWithMetadata.ticker).toBe('Ticker');
});

test('it should returns asset logo', () => {
  expect(assetInfoWithoutMetadata.logo).toBe(undefined);
  expect(assetInfoWithMetadata.logo).toBe('https://logo.url');
});

test('it should add metadata to asset info', () => {
  const withMetadata = assetInfoWithoutMetadata.withMetadata({
    name: assetInfoWithoutMetadata.name,
    policyId: assetInfoWithoutMetadata.policyId,
    decimals: 6,
  });

  expect(assetInfoWithoutMetadata.decimals).toBe(0);
  expect(withMetadata.decimals).toBe(6);
});

test('it should create same asset by usign different params', () => {
  const asset1 = AssetInfo.new({
    policyId: '',
    type: 'raw',
    name: '',
  });
  const asset2 = AssetInfo.new({
    policyId: '',
    type: 'base16',
    name: '',
  });
  const asset3 = AssetInfo.new({
    policyId: '',
    type: 'cbor',
    name: '40',
  });

  expect(asset1.name).toBe(asset2.name);
  expect(asset1.name).toBe(asset3.name);
  expect(asset2.name).toBe(asset3.name);

  expect(asset1.nameCbor).toBe(asset2.nameCbor);
  expect(asset1.nameCbor).toBe(asset3.nameCbor);
  expect(asset2.nameCbor).toBe(asset3.nameCbor);

  expect(asset1.nameBase16).toBe(asset2.nameBase16);
  expect(asset1.nameBase16).toBe(asset3.nameBase16);
  expect(asset2.nameBase16).toBe(asset3.nameBase16);
});

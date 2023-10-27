import {
  AssetName,
  ScriptHash,
} from '@emurgo/cardano-serialization-lib-browser';

import { stringToHex } from '../../utils/stringToHex/stringToHex.ts';
import { AssetInfo } from './AssetInfo.ts';

const assetPolicyId =
  '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
const assetName = 'SPF';
const assetInfo = AssetInfo.fromNameString(assetPolicyId, assetName);

test('it should create valid asset info instance from name', () => {
  expect(assetInfo).toBeInstanceOf(AssetInfo);
});

test('it should returns valid asset name', () => {
  expect(assetInfo.name).toBe(assetName);
});

test('it should returns valid asset name hex', () => {
  expect(assetInfo.nameHex).toBe('535046');
});

test('it should returns valid asset name cbor hex', () => {
  expect(assetInfo.nameCborHex).toBe('43535046');
});

test('it should returns valid asset name wasm instance', () => {
  expect(assetInfo.wasmName).toBeInstanceOf(AssetName);
  expect(assetInfo.wasmName.to_hex()).toBe('43535046');
});

test('it should returns valid script hash wasm instance', () => {
  expect(assetInfo.wasmPolicyId).toBeInstanceOf(ScriptHash);
  expect(assetInfo.wasmPolicyId.to_hex()).toBe(assetPolicyId);
});

test('it should returns valid policy id', () => {
  expect(assetInfo.policyId).toBe(assetPolicyId);
});

test('it should returns valid spectrum Id', () => {
  expect(assetInfo.spectrumId).toBe(`${assetPolicyId}.${assetName}`);
});

test('it should returns valid asset subject', () => {
  expect(assetInfo.subject).toBe(`${assetPolicyId}${stringToHex(assetName)}`);
});

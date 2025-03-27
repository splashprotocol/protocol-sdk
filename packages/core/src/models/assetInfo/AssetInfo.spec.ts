import { AssetInfo } from './AssetInfo.ts';

const adaRaw = '';
const adaHex = '';
const adaCborHex = '40';
const adaPolicy = '';
const adaTicker = 'ADA';
const adaDecimals = 6;
const adaSubject = `${adaPolicy}${adaHex}`;
const adaAssetId = `${adaPolicy}.${adaHex}`;

const spfRaw = 'SPF';
const spfHex = '535046';
const spfCborHex = '43535046';
const spfPolicy = '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75';
const spfTicker = 'SPF';
const spfDecimals = 6;
const spfSubject = `${spfPolicy}${spfHex}`;
const spfAssetId = `${spfPolicy}.${spfHex}`;

const splashRaw = 'SPLASH';
const splashHex = '53504c415348';
const splashCborHex = '4653504c415348';
const splashPolicy = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3';
const splashTicker = 'SPLASH';
const splashDecimals = 6;
const splashSubject = `${splashPolicy}${splashHex}`;
const splashAssetId = `${splashPolicy}.${splashHex}`;

test('it should returns correct ada asset info', () => {
  expect(AssetInfo.ada.nameBase16).toBe(adaHex);
  expect(AssetInfo.ada.name).toBe(adaRaw);
  expect(AssetInfo.ada.nameCbor).toBe(adaCborHex);
  expect(AssetInfo.ada.subject).toBe(adaSubject);
  expect(AssetInfo.ada.assetId).toBe(adaAssetId);
  expect(AssetInfo.ada.ticker).toBe(adaTicker);
  expect(AssetInfo.ada.policyId).toBe(adaPolicy);
  expect(AssetInfo.ada.decimals).toBe(adaDecimals);
});

test('it should returns correct spf asset info', () => {
  expect(AssetInfo.spf.nameBase16).toBe(spfHex);
  expect(AssetInfo.spf.name).toBe(spfRaw);
  expect(AssetInfo.spf.nameCbor).toBe(spfCborHex);
  expect(AssetInfo.spf.subject).toBe(spfSubject);
  expect(AssetInfo.spf.assetId).toBe(spfAssetId);
  expect(AssetInfo.spf.ticker).toBe(spfTicker);
  expect(AssetInfo.spf.policyId).toBe(spfPolicy);
  expect(AssetInfo.spf.decimals).toBe(spfDecimals);
});

test('it should returns correct splash asset info', () => {
  expect(AssetInfo.splash.nameBase16).toBe(splashHex);
  expect(AssetInfo.splash.name).toBe(splashRaw);
  expect(AssetInfo.splash.nameCbor).toBe(splashCborHex);
  expect(AssetInfo.splash.subject).toBe(splashSubject);
  expect(AssetInfo.splash.assetId).toBe(splashAssetId);
  expect(AssetInfo.splash.ticker).toBe(splashTicker);
  expect(AssetInfo.splash.policyId).toBe(splashPolicy);
  expect(AssetInfo.splash.decimals).toBe(splashDecimals);
});

test('it should create valid asset info from string', () => {
  const spf = AssetInfo.fromString(spfPolicy, spfRaw);

  expect(spf.nameBase16).toBe(spfHex);
  expect(spf.name).toBe(spfRaw);
  expect(spf.nameCbor).toBe(spfCborHex);
  expect(spf.subject).toBe(spfSubject);
  expect(spf.assetId).toBe(spfAssetId);
});

test('it should create valid asset info from base16', () => {
  const spf = AssetInfo.fromBase16(spfPolicy, spfHex);

  expect(spf.nameBase16).toBe(spfHex);
  expect(spf.name).toBe(spfRaw);
  expect(spf.nameCbor).toBe(spfCborHex);
  expect(spf.subject).toBe(spfSubject);
  expect(spf.assetId).toBe(spfAssetId);
});

test('it should create valid asset info from cbor', () => {
  const spf = AssetInfo.fromCbor(spfPolicy, spfCborHex);

  expect(spf.nameBase16).toBe(spfHex);
  expect(spf.name).toBe(spfRaw);
  expect(spf.nameCbor).toBe(spfCborHex);
  expect(spf.subject).toBe(spfSubject);
  expect(spf.assetId).toBe(spfAssetId);
});

test('it should create valid asset info from cbor', () => {
  const spf = AssetInfo.fromAssetId(spfAssetId);

  expect(spf.nameBase16).toBe(spfHex);
  expect(spf.name).toBe(spfRaw);
  expect(spf.nameCbor).toBe(spfCborHex);
  expect(spf.subject).toBe(spfSubject);
  expect(spf.assetId).toBe(spfAssetId);
});

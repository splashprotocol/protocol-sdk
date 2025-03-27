import { UTxO } from './UTxO.ts';
import { CML } from '../../utils/Cml/Cml.ts';
import { Currencies } from '@splashprotocol/core';

test('It should create valid instance of UTxO', async () => {
  const utxo = await UTxO.new({
    cbor: '828258202a80448168608ed61208f2bc31ae00770b7feffaa8000a7bc54c00dd5f96274d0182583901719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b257846f6bb07f5b2825885e4502679e699b4e60a0c4609a46bc35454cd821a0011a008a1581cf66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880a144695553441a001c69e0',
  });
  const C = await CML;

  expect(utxo.wasm).toBeInstanceOf(C.TransactionUnspentOutput);
  expect(utxo.wasmOutput).toBeInstanceOf(C.TransactionOutput);
  expect(utxo.wasmInput).toBeInstanceOf(C.TransactionInput);
  expect(typeof utxo.address).toBe('string');
  expect(typeof utxo.refHash).toBe('string');
  expect(utxo.value).toBeInstanceOf(Currencies);
  expect(utxo.value.ada.amount).toBe(1155080n);
});

import {
  Ed25519Signature,
  PublicKey,
} from '@dcspark/cardano-multiplatform-lib-browser';
import * as Cbor from 'cbor-web';

import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { HexString } from '../../../../core/types/types.ts';
import { bytesToHex } from '../../../../core/utils/bytesToHex/bytesToHex.ts';
import { stringToHex } from '../../../../core/utils/stringToHex/stringToHex.ts';
import { Operation } from '../common/Operation.ts';
import { payToContract } from '../payToContract/payToContract.ts';

interface DataToSignBody {
  readonly nft: {
    readonly policyId: HexString;
    readonly name: HexString;
  };
  readonly xToWithdraw: string;
  readonly yToWithdraw: string;
  readonly pkh: string;
  readonly pk: string;
  readonly exFee: string;
  readonly nonce: string;
}

const getDataToSign = (body: DataToSignBody) =>
  fetch('http://localhost:8000/withdrawal/data/prepare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => data.dataToSign);

export interface WithdrawRoyaltyConfig {
  readonly xToWithdraw?: Currency;
  readonly yToWithdraw?: Currency;
  readonly pool: CfmmPool;
}

const withdrawRoyaltyData = Data.Tuple([
  Data.Tuple([
    Data.AssetInfo,
    Data.BigInt,
    Data.BigInt,
    Data.Bytes,
    Data.Bytes,
    Data.BigInt,
  ]),
  Data.Bytes,
  Data.Bytes,
]);

export const withdrawRoyalty: Operation<[WithdrawRoyaltyConfig]> =
  ({ pool, xToWithdraw = pool.royaltyX, yToWithdraw = pool.royaltyY }) =>
  async (context) => {
    if (pool.cfmmType !== 'royalty') {
      throw new Error('incorrect pool type');
    }
    const { key } = await context.splash.api.signMessage(
      stringToHex('Public key check'),
    );
    const publicKey = PublicKey.from_bytes(Cbor.decode(key).get(-2));

    const dataToSign = await getDataToSign({
      nft: {
        policyId: pool.nft.policyId,
        name: pool.nft.nameBase16,
      },
      xToWithdraw: xToWithdraw.amount.toString(),
      yToWithdraw: yToWithdraw.amount.toString(),
      pkh: publicKey.hash().to_hex(),
      pk: bytesToHex(publicKey.to_raw_bytes()),
      exFee: 4_500_000n.toString(),
      nonce: '0',
    });

    const { signature, key: coseKey } =
      await context.splash.api.signMessage(dataToSign);
    console.log(signature, coseKey);
    const data = withdrawRoyaltyData([
      [
        pool.nft,
        xToWithdraw.amount,
        yToWithdraw.amount,
        publicKey.hash().to_hex(),
        bytesToHex(publicKey.to_raw_bytes()),
        4_500_000n,
      ],
      Ed25519Signature.from_raw_bytes(Cbor.decode(signature)[3]).to_hex(),
      '846a5369676e6174757265315846a201276761646472657373583900719bee424a97b58b3dca88fe5da6feac6494aa7226f975f3506c5b257846f6bb07f5b2825885e4502679e699b4e60a0c4609a46bc35454cd405889',
    ]);

    return payToContract(
      {
        version: 'plutusV2',
        script: '40a533ea4e3023c62912f029c7ad388bf3c2254e9c7fb3450024bc6e',
      },
      Currencies.new([Currency.ada(10_000_000n)]),
      data,
    )(context);
  };

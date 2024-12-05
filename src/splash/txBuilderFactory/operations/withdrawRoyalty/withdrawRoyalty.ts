import {
  Ed25519Signature,
  PublicKey,
} from '@dcspark/cardano-multiplatform-lib-browser';
//@ts-ignore
import * as Cbor from 'cbor2';

import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { HexString } from '../../../../core/types/types.ts';
import { hexToBytes } from '../../../../core/utils/hexToBytes/hexToBytes.ts';
import { Operation } from '../common/Operation.ts';
import { getPrependData } from '../createRoyaltyPool/getPrependData/getPrependData.ts';
import { payToContract } from '../payToContract/payToContract.ts';

interface DataToSignBody {
  readonly nft: {
    readonly policyId: HexString;
    readonly name: HexString;
  };
  readonly xToWithdraw: string;
  readonly yToWithdraw: string;
  readonly pkh: string;
  readonly exFee: string;
  readonly nonce: string;
}

const getDataToSign = (body: DataToSignBody) =>
  fetch('https://royalty-utils.splash.trade/withdrawal/data/prepare', {
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
    Data.BigInt,
  ]),
  Data.Bytes,
  Data.Bytes,
]);

export const withdrawRoyalty: Operation<[WithdrawRoyaltyConfig]> =
  ({ pool, xToWithdraw = pool.royaltyX, yToWithdraw = pool.royaltyY }) =>
  async (context) => {
    console.log(xToWithdraw.amount, yToWithdraw.amount);
    if (pool.cfmmType !== 'royalty') {
      throw new Error('incorrect pool type');
    }
    const publicKey = PublicKey.from_bytes(hexToBytes(pool.royaltyPk!));

    const dataToSign = await getDataToSign({
      nft: {
        policyId: pool.nft.policyId,
        name: pool.nft.nameBase16,
      },
      xToWithdraw: xToWithdraw.amount.toString(),
      yToWithdraw: yToWithdraw.amount.toString(),
      pkh: publicKey.hash().to_hex(),
      exFee: 4_500_000n.toString(),
      nonce: pool.royaltyNonce?.toString()!,
    });

    const { signature } = await context.splash.api.signMessage(
      dataToSign,
      pool.royaltyUserAddress,
    );
    const prependData = getPrependData(signature);
    const ed25519Signature = Ed25519Signature.from_raw_bytes(
      Cbor.decode(signature)[3],
    );

    if (
      !publicKey.verify(hexToBytes(prependData + dataToSign), ed25519Signature)
    ) {
      throw new Error('invalid royalty data');
    }
    console.log('valid!', prependData);

    const data = withdrawRoyaltyData([
      [
        pool.nft,
        xToWithdraw.amount,
        yToWithdraw.amount,
        publicKey.hash().to_hex(),
        4_500_000n,
      ],
      ed25519Signature.to_hex(),
      prependData,
    ]);

    return payToContract(
      {
        version: 'plutusV2',
        script: '92c094b90cf3637a96a13e9bc9a04ce8bb7e48c7ed0b5d1cc5ca7332',
      },
      Currencies.new([Currency.ada(10_000_000n)]),
      data,
    )(context);
  };

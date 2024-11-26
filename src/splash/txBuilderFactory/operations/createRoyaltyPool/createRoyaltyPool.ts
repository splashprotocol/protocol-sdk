import { PublicKey } from '@dcspark/cardano-multiplatform-lib-browser';
// @ts-ignore
import * as Cbor from 'cbor2';

import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import {
  BURN_LQ,
  EMISSION_LP,
} from '../../../../core/models/pool/common/emissionLp.ts';
import {
  MIN_POOL_ADA_VALUE_N2T,
  MIN_POOL_ADA_VALUE_T2T,
} from '../../../../core/models/pool/common/minPoolAdaValue.ts';
import {
  CborHexString,
  HexString,
  percent,
  TransactionHash,
} from '../../../../core/types/types.ts';
import { bytesToHex } from '../../../../core/utils/bytesToHex/bytesToHex.ts';
import { math } from '../../../../core/utils/math/math.ts';
import { stringToHex } from '../../../../core/utils/stringToHex/stringToHex.ts';
import { Operation } from '../common/Operation.ts';
import { sqrt } from '../createCfmmPool/createCfmmPool.ts';
import { payToContract } from '../payToContract/payToContract.ts';

interface GetPolicyAndScriptParams {
  readonly txHash: TransactionHash;
  readonly index: bigint;
  readonly base16Name: HexString;
  readonly emission: bigint;
}
export interface GetPolicyAndScriptResult {
  readonly policyId: CborHexString;
  readonly script: CborHexString;
}

const getPolicyAndScript = async ({
  txHash,
  index,
  emission,
  base16Name,
}: GetPolicyAndScriptParams): Promise<GetPolicyAndScriptResult> => {
  await fetch('https://meta.spectrum.fi/cardano/minting/data/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      txRef: txHash,
      outId: Number(index),
      tnName: base16Name,
      qty: emission.toString(),
    }),
  });

  return fetch('https://meta.spectrum.fi/cardano/minting/data/finalizeNew/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      txRef: txHash,
      outId: Number(index),
      tnName: base16Name,
      qty: emission.toString(),
    }),
  }).then((res) => res.json());
};

const getDaoPolicy = async (
  assetInfo: AssetInfo,
  editableFee: boolean,
): Promise<HexString> => {
  return fetch('https://meta.spectrum.fi/cardano/dao/feeSwitch/data/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      nftCS: assetInfo.policyId,
      nftTN: assetInfo.nameBase16,
      editableFee,
    }),
  })
    .then((res) => res.json())
    .then((data) => data.curSymbol);
};

export const createRoyaltyPoolData = Data.Tuple([
  // nft
  Data.AssetInfo,
  // x
  Data.AssetInfo,
  // y
  Data.AssetInfo,
  // lq
  Data.AssetInfo,
  // pool fee
  Data.BigInt,
  // treasury fee
  Data.BigInt,
  // royalty fee
  Data.BigInt,
  // treasury x
  Data.BigInt,
  // treasury y
  Data.BigInt,
  // royalty x
  Data.BigInt,
  // royalty y
  Data.BigInt,
  // DAO
  Data.List(Data.DaoPolicy),
  // treasury address
  Data.Bytes,
  // royalty pk
  Data.Bytes,
  // royalty nonce
  Data.BigInt,
]);

export interface CreateWeightedPoolConfig {
  readonly x: Currency;
  readonly y: Currency;
  readonly royaltyFee: percent;
  readonly poolFee?: percent;
  readonly treasuryFee?: percent;
  readonly editableFee?: boolean;
}

export const createRoyaltyPool: Operation<[CreateWeightedPoolConfig]> =
  ({
    x,
    y,
    treasuryFee = 0.03,
    poolFee = 0.3,
    editableFee = true,
    royaltyFee,
  }) =>
  async (context) => {
    const newX = x.isAda() ? x : y;
    const newY = x.isAda() ? y : x;

    if (newX.isAda() && newX.lt(MIN_POOL_ADA_VALUE_N2T)) {
      throw new Error(
        `Min value ada for pool is ${MIN_POOL_ADA_VALUE_N2T.toString()} ADA`,
      );
    }

    const MINT_LQ = EMISSION_LP - BURN_LQ;
    const [firstTokenUtxo] = context.uTxOsSelector.select(
      Currencies.new([newY]),
    );
    const base16NftName = stringToHex(
      `${newY.asset.name}_${newX.asset.name || 'ADA'}_NFT`,
    );
    const base16LqName = stringToHex(
      `${newY.asset.name}_${newX.asset.name || 'ADA'}_LQ`,
    );

    const nftMintInfo = await getPolicyAndScript({
      txHash: firstTokenUtxo.txHash,
      index: firstTokenUtxo.index,
      base16Name: base16NftName,
      emission: 1n,
    });
    const lqMintInfo = await getPolicyAndScript({
      txHash: firstTokenUtxo.txHash,
      index: firstTokenUtxo.index,
      base16Name: base16LqName,
      emission: MINT_LQ,
    });
    const poolLpAmount = EMISSION_LP - sqrt(x.amount * y.amount);
    const nftAssetInfo = AssetInfo.new({
      policyId: nftMintInfo.policyId,
      name: base16NftName,
      type: 'base16',
    });
    const lqAssetInfo = AssetInfo.new({
      policyId: lqMintInfo.policyId,
      name: base16LqName,
      type: 'base16',
    });
    const poolFeeNum = BigInt(
      math.evaluate(`(1 - ${poolFee} / 100) * 100000`).toFixed(),
    );
    const treasuryFeeNum = BigInt(
      math.evaluate(`${treasuryFee} / 100 * 100000`).toFixed(),
    );
    const royaltyFeeNum = BigInt(
      math.evaluate(`${royaltyFee} / 100 * 100000`).toFixed(),
    );
    const daoPolicy = await getDaoPolicy(nftAssetInfo, editableFee);
    const { key, signature } = await context.splash.api.signMessage(
      stringToHex('Public key verification'),
    );

    const data = createRoyaltyPoolData([
      nftAssetInfo,
      x.asset,
      y.asset,
      lqAssetInfo,
      poolFeeNum,
      treasuryFeeNum,
      royaltyFeeNum,
      0n,
      0n,
      0n,
      0n,
      [
        [
          {
            hash: daoPolicy,
            type: 'scriptCredential',
          },
        ],
      ],
      '75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
      bytesToHex(PublicKey.from_bytes(Cbor.decode(key).get(-2)).to_raw_bytes()),
      0n,
    ]);
    const depositAda = newX.isAda() ? Currency.ada(0n) : MIN_POOL_ADA_VALUE_T2T;

    context.transactionCandidate.addMint({
      currency: Currency.new(1n, nftAssetInfo),
      plutusV2ScriptCbor: nftMintInfo.script,
      redeemer: Data.Int(0),
      exUnits: {
        mem: 300111n,
        steps: 153808137n,
      },
    });

    context.transactionCandidate.addMetadata([
      42n,
      bytesToHex(Cbor.decode(Cbor.decode(signature)[0]).get('address')),
    ]);

    context.transactionCandidate.addMint({
      currency: Currency.new(MINT_LQ, lqAssetInfo),
      plutusV2ScriptCbor: lqMintInfo.script,
      redeemer: Data.Int(1),
      exUnits: {
        mem: 10000000n,
        steps: 9000000000n,
      },
    });
    return payToContract(
      {
        script: 'cb684a69e78907a9796b21fc150a758af5f2805e5ed5d5a8ce9f76f1',
        version: 'plutusV2',
      },
      Currencies.new([
        x,
        y,
        Currency.new(poolLpAmount, lqAssetInfo),
        Currency.new(1n, nftAssetInfo),
        depositAda,
      ]),
      data,
      {
        stakeKeyHash:
          'b2f6abf60ccde92eae1a2f4fdf65f2eaf6208d872c6f0e597cc10b07',
        stakeKeyHashType: 'script',
      },
    )(context);
  };

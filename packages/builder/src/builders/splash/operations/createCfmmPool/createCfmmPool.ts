import {
  AssetInfo,
  BURN_LQ,
  CborHexString,
  Currencies,
  Currency,
  EMISSION_LP,
  HexString,
  math,
  percent,
  stringToHex,
  TransactionHash,
} from '@splashprotocol/core';
import { Operation } from '../../../../core/types/Operation.ts';
import { SplashApiType } from '@splashprotocol/api';
import { Output } from '../../../../core/models/Output/Output.ts';
import {
  MIN_POOL_ADA_VALUE_N2T,
  MIN_POOL_ADA_VALUE_T2T,
} from '../common/minPoolAdaValue.ts';
import { createCfmmPoolDatum } from './createCfmmPoolDatum/createCfmmPoolDatum.ts';
import { Datum } from '../../../../core/models/Datum/Datum.ts';
import { payToContract } from '../../../../core/operations/payToContract/payToContract.ts';
import { createInitialBuyOutput } from './createInitialBuyOutput/createInitialBuyOutput.ts';

export function sqrt(x: bigint): bigint {
  function go(n: bigint, x0: bigint): bigint {
    const x1 = (n / x0 + x0) >> 1n;
    if (x0 === x1 || x0 === x1 - 1n) {
      return x0;
    }
    return go(n, x1);
  }

  if (x < 0n) throw 'Square root of negative number is not supported';
  else if (x < 2n) return x;
  else return go(x, 1n);
}

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

export interface CreateCfmmPoolConfig {
  readonly x: Currency;
  readonly y: Currency;
  readonly poolFee?: percent;
  readonly treasuryFee?: percent;
  readonly editableFee?: boolean;
  readonly initialBuy?: Currency;
}

export const createCfmmPool: Operation<
  [CreateCfmmPoolConfig],
  SplashApiType,
  Output
> =
  ({
    x,
    y,
    treasuryFee = 0.03,
    poolFee = 0.3,
    editableFee = true,
    initialBuy,
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
    const nftAssetInfo = AssetInfo.fromBase16(
      nftMintInfo.policyId,
      base16NftName,
    );
    const lqAssetInfo = AssetInfo.fromBase16(lqMintInfo.policyId, base16LqName);
    const poolFeeNum = BigInt(
      math.evaluate(`(1 - ${poolFee} / 100) * 100000`).toFixed(),
    );
    const treasuryFeeNum = BigInt(
      math.evaluate(`${treasuryFee} / 100 * 100000`).toFixed(),
    );
    const daoPolicy = await getDaoPolicy(nftAssetInfo, editableFee);

    const data = await createCfmmPoolDatum.serialize({
      nft: {
        policyId: nftAssetInfo.policyId,
        name: nftAssetInfo.nameBase16,
      },
      x: {
        policyId: x.asset.policyId,
        name: x.asset.nameBase16,
      },
      y: {
        policyId: y.asset.policyId,
        name: y.asset.nameBase16,
      },
      lq: {
        policyId: lqAssetInfo.policyId,
        name: lqAssetInfo.nameBase16,
      },
      poolFee: poolFeeNum,
      treasuryFee: treasuryFeeNum,
      treasuryX: 0n,
      treasuryY: 0n,
      dao: [{ scriptHash: daoPolicy }],
      lqBound: 0n,
      treasury: '75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
    });
    const depositAda = newX.isAda() ? Currency.ada(0n) : MIN_POOL_ADA_VALUE_T2T;

    context.transactionCandidate.addMint({
      asset: Currency.new(1n, nftAssetInfo),
      script: nftMintInfo.script,
      redeemer: await Datum.integer().serialize(0n),
      exUnits: {
        mem: 300111n,
        steps: 153808137n,
      },
    });
    context.transactionCandidate.addMint({
      asset: Currency.new(MINT_LQ, lqAssetInfo),
      script: lqMintInfo.script,
      redeemer: await Datum.integer().serialize(1n),
      exUnits: {
        mem: 10000000n,
        steps: 9000000000n,
      },
    });
    context.transactionCandidate.addInput(firstTokenUtxo);
    if (initialBuy) {
      await createInitialBuyOutput(
        {
          poolFee: poolFeeNum,
          treasuryFee: treasuryFeeNum,
          orderIndex: BigInt(context.transactionCandidate.outputs.length),
          input: initialBuy,
          x,
          y,
          uTxO: firstTokenUtxo,
        },
        context,
      );
    }
    return payToContract(
      {
        scriptHash: '9dee0659686c3ab807895c929e3284c11222affd710b09be690f924d',
        stakeCredentials: {
          hash: 'b2f6abf60ccde92eae1a2f4fdf65f2eaf6208d872c6f0e597cc10b07',
          type: 'script',
        },
      },
      Currencies.new([
        x,
        y,
        Currency.new(poolLpAmount, lqAssetInfo),
        Currency.new(1n, nftAssetInfo),
        depositAda,
      ]),
      data,
    )(context);
  };

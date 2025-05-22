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
import { HexString, percent } from '../../../../core/types/types.ts';
import { math } from '../../../../core/utils/math/math.ts';
import { stringToHex } from '../../../../core/utils/stringToHex/stringToHex.ts';
import { getPolicyAndScript } from '../common/getPolicyAndScript.ts';
import { Operation } from '../common/Operation.ts';
import { payToContract } from '../payToContract/payToContract.ts';

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

export const createCfmmPoolData = Data.Tuple([
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
  // treasury x
  Data.BigInt,
  // treasury y
  Data.BigInt,
  // DAO
  Data.List(Data.DaoPolicy),
  // lq bound
  Data.BigInt,
  // treasury address
  Data.Bytes,
]);

export interface CreateWeightedPoolConfig {
  readonly x: Currency;
  readonly y: Currency;
  readonly poolFee?: percent;
  readonly treasuryFee?: percent;
  readonly editableFee?: boolean;
}

export const createCfmmPool: Operation<[CreateWeightedPoolConfig]> =
  ({ x, y, treasuryFee = 0.03, poolFee = 0.3, editableFee = true }) =>
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
    });
    const lqMintInfo = await getPolicyAndScript({
      txHash: firstTokenUtxo.txHash,
      index: firstTokenUtxo.index,
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
    const daoPolicy = await getDaoPolicy(nftAssetInfo, editableFee);

    const data = createCfmmPoolData([
      nftAssetInfo,
      x.asset,
      y.asset,
      lqAssetInfo,
      poolFeeNum,
      treasuryFeeNum,
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
      0n,
      '75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
    ]);
    const depositAda = newX.isAda() ? Currency.ada(0n) : MIN_POOL_ADA_VALUE_T2T;

    context.transactionCandidate.addMint({
      currency: Currency.new(1n, nftAssetInfo),
      script: {
        type: 'plutusV3',
        value: nftMintInfo.script,
      },
      redeemer: nftMintInfo.redeemer,
      exUnits: {
        mem: 300111n,
        steps: 153808137n,
      },
    });
    context.transactionCandidate.addMint({
      currency: Currency.new(MINT_LQ, lqAssetInfo),
      script: {
        value: lqMintInfo.script,
        type: 'plutusV3',
      },
      redeemer: nftMintInfo.redeemer,
      exUnits: {
        mem: 10000000n,
        steps: 9000000000n,
      },
    });
    return payToContract(
      {
        script: '9dee0659686c3ab807895c929e3284c11222affd710b09be690f924d',
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

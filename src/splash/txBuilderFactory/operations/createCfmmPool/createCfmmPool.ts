import { AssetInfo } from '../../../../core/models/assetInfo/AssetInfo.ts';
import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { EMISSION_LP } from '../../../../core/models/pool/common/emissionLp.ts';
import {
  CborHexString,
  HexString,
  percent,
  TransactionHash,
} from '../../../../core/types/types.ts';
import { math } from '../../../../core/utils/math/math.ts';
import { stringToHex } from '../../../../core/utils/stringToHex/stringToHex.ts';
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

export const MIN_POOL_ADA_VALUE = Currency.ada(5000000n);

export const createCfmmPool: Operation<[CreateWeightedPoolConfig]> =
  ({ x, y, treasuryFee = 0.03, poolFee = 0.3, editableFee = true }) =>
  async (context) => {
    const newX = x.isAda() ? x : y;
    const newY = x.isAda() ? y : x;
    if (!newX.isAda()) {
      throw new Error('Only nt2 pool supported now');
    }
    if (newX.lt(MIN_POOL_ADA_VALUE)) {
      throw new Error('Min value ada for pool is 5 ADA');
    }

    const [firstTokenUtxo] = context.uTxOsSelector.select(
      Currencies.new([newY]),
    );
    const base16NftName = stringToHex(`${newY.asset.name}_ADA_NFT`);
    const base16LqName = stringToHex(`${newY.asset.name}_ADA_LQ`);

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
      emission: EMISSION_LP,
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
      'bf02d7f5637906e58738fa91db633749edb0a1bc3d5e9bf6131ca1ba',
    ]);
    context.transactionCandidate.addMint({
      currency: Currency.new(1n, nftAssetInfo),
      plutusV2ScriptCbor: nftMintInfo.script,
      redeemer: Data.Int(0),
      exUnits: {
        mem: 300111n,
        steps: 153808137n,
      },
    });
    context.transactionCandidate.addMint({
      currency: Currency.new(EMISSION_LP, lqAssetInfo),
      plutusV2ScriptCbor: lqMintInfo.script,
      redeemer: Data.Int(1),
      exUnits: {
        mem: 10000000n,
        steps: 9000000000n,
      },
    });

    return payToContract(
      {
        script: 'f002facfd69d51b63e7046c6d40349b0b17c8dd775ee415c66af3ccc',
        version: 'plutusV2',
      },
      Currencies.new([
        x,
        y,
        Currency.new(poolLpAmount, lqAssetInfo),
        Currency.new(1n, nftAssetInfo),
      ]),
      data,
      {
        stakeKeyHash:
          'b2f6abf60ccde92eae1a2f4fdf65f2eaf6208d872c6f0e597cc10b07',
        stakeKeyHashType: 'script',
      },
    )(context);
  };

import {
  Address,
  BaseAddress,
} from '@dcspark/cardano-multiplatform-lib-browser';

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

const WEIGHT_DENOM = 5n;

const getPolicyAndScript = async ({
  txHash,
  index,
  emission,
  base16Name,
}: GetPolicyAndScriptParams): Promise<GetPolicyAndScriptResult> => {
  await fetch('http://88.99.59.114:8081/getData/', {
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

  return fetch('http://88.99.59.114:3490/getData/', {
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

const createWeightPoolData = Data.Tuple([
  // nft
  Data.AssetInfo,
  // x
  Data.AssetInfo,
  // x weight
  Data.BigInt,
  // y
  Data.AssetInfo,
  // y weight
  Data.BigInt,
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
  // address
  Data.Bytes,
  // invariant
  Data.BigInt,
]);

export interface CreateWeightedPoolConfig {
  readonly x: Currency;
  readonly xWeight: percent;
  readonly y: Currency;
  readonly yWeight: percent;
  readonly poolFee?: percent;
  readonly treasuryFee?: percent;
}

export const MIN_POOL_ADA_VALUE = Currency.ada(5000000n);

export const createWeightedPool: Operation<[CreateWeightedPoolConfig]> =
  ({ x, xWeight, y, yWeight, treasuryFee = 0.03, poolFee = 0.3 }) =>
  async (context) => {
    const newX = x.isAda() ? x : y;
    const newY = x.isAda() ? y : x;
    if (!newX.isAda()) {
      throw new Error('Only nt2 pool supported now');
    }
    if (newX.lt(MIN_POOL_ADA_VALUE)) {
      throw new Error('Min value ada for pool is 5 ADA');
    }
    if (xWeight + yWeight !== 100) {
      throw new Error('xWeight + yWeight should be equals 100');
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
    const normalizedXWeight = math.evaluate(
      `${xWeight} * ${WEIGHT_DENOM} / 100`,
    );
    const normalizedYWeight = math.evaluate(
      `${yWeight} * ${WEIGHT_DENOM} / 100`,
    );
    const invariant = math.evaluate(
      `${newX.amount}^${normalizedXWeight} * ${newY.amount}^${normalizedYWeight}`,
    );
    const toSubtract = math.floor(math.nthRoot(invariant, 5));
    const poolLpAmount = EMISSION_LP - BigInt((toSubtract as any).toFixed());
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
    const address = BaseAddress.from_address(
      Address.from_bech32(context.userAddress),
    );

    const data = createWeightPoolData([
      nftAssetInfo,
      x.asset,
      BigInt(normalizedXWeight.toFixed()),
      y.asset,
      BigInt(normalizedYWeight.toFixed()),
      lqAssetInfo,
      poolFeeNum,
      treasuryFeeNum,
      0n,
      0n,
      [
        [
          {
            hash: '1b810d1426ceb8a7a61d78899fe01a426ac770deb6daad335e2c59eb',
            type: 'scriptCredential',
          },
        ],
      ],
      address?.stake().as_pub_key()?.to_hex()!,
      BigInt(invariant.toFixed()),
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
        script: 'cced077b21e5898610d411e174b8a7eca61669f8347ab04624fcfe4f',
        version: 'plutusV2',
      },
      Currencies.new([
        x,
        y,
        Currency.new(poolLpAmount, lqAssetInfo),
        Currency.new(1n, nftAssetInfo),
      ]),
      data,
    )(context);
  };

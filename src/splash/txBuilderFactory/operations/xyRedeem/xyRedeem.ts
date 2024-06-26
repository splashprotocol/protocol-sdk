import {
  Address,
  BaseAddress,
  NetworkId,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { StablePool } from '../../../../core/models/pool/stable/StablePool.ts';
import { WeightedPool } from '../../../../core/models/pool/weighted/WeightedPool.ts';
import { EXECUTOR_FEE } from '../../../../core/utils/executorFee/executorFee.ts';
import {
  OLD_SPLASH_POOL_NFT,
  OLD_SPLASH_POOLS_NFTS,
} from '../../../../core/utils/oldSplashPool/oldSplashPool.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAdaForExecutor/predictDepositAda.ts';
import { toContractAddress } from '../../../../core/utils/toContractAddress/toContractAddress.ts';
import { Operation } from '../common/Operation.ts';
import { payToContract } from '../payToContract/payToContract.ts';

export const RedeemData = Data.Tuple([
  // nft
  Data.AssetInfo,
  // x
  Data.AssetInfo,
  // y
  Data.AssetInfo,
  // lq
  Data.AssetInfo,
  // exFee
  Data.BigInt,
  // pkh
  Data.Bytes,
  // skh
  Data.Optional(Data.Bytes),
]);

const MINIMUM_COLLATERAL_ADA = Currency.ada(1_500_000n);

export const xyRedeem: Operation<
  [CfmmPool | WeightedPool | StablePool, Currency]
> = (pool, lq) => (context) => {
  const executorFeeWithTxFee = EXECUTOR_FEE.multiply(3n);
  const address = BaseAddress.from_address(
    Address.from_bech32(context.userAddress),
  );
  const estimatedAssets = pool.convertLpToAssets(lq);
  const redeemScript =
    pool instanceof WeightedPool
      ? pool.id === OLD_SPLASH_POOL_NFT ||
        OLD_SPLASH_POOLS_NFTS.includes(pool.id)
        ? context.operationsConfig.operations.redeemWeighted.script
        : context.operationsConfig.operations.redeemWeightedV2.script
      : pool instanceof StablePool
      ? context.operationsConfig.operations.redeemStable.script
      : pool.cfmmType === 'feeSwitch'
      ? context.operationsConfig.operations.redeemFeeSwitch.script
      : context.operationsConfig.operations.redeemDefault.script;
  const redeemAdaForXYBox = predictDepositAda(context.pParams, {
    address: context.userAddress,
    value: Currencies.new([estimatedAssets.x, estimatedAssets.y]),
  });
  const outputValue = Currencies.new([
    lq,
    executorFeeWithTxFee,
    redeemAdaForXYBox,
  ]);
  const data = RedeemData([
    pool.nft,
    pool.x.asset,
    pool.y.asset,
    pool.lq.asset,
    executorFeeWithTxFee.amount,
    address?.payment().as_pub_key()?.to_hex()!,
    address?.stake().as_pub_key()?.to_hex(),
  ]);

  const depositAdaForOrder = Currency.max([
    predictDepositAda(context.pParams, {
      address: toContractAddress(
        context.network === 'mainnet'
          ? NetworkId.mainnet()
          : NetworkId.testnet(),
        redeemScript,
      ),
      data: data,
      value: outputValue,
    }),
    MINIMUM_COLLATERAL_ADA,
  ]);

  return payToContract(
    {
      script: redeemScript,
      version: 'plutusV2',
    },
    outputValue.plus([depositAdaForOrder]),
    data,
  )(context);
};

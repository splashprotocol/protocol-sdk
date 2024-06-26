import {
  Address,
  BaseAddress,
  NetworkId,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { Output } from '../../../../core/models/output/Output.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { StablePool } from '../../../../core/models/pool/stable/StablePool.ts';
import { WeightedPool } from '../../../../core/models/pool/weighted/WeightedPool.ts';
import { EXECUTOR_FEE } from '../../../../core/utils/executorFee/executorFee.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAdaForExecutor/predictDepositAda.ts';
import { toContractAddress } from '../../../../core/utils/toContractAddress/toContractAddress.ts';
import { Operation } from '../common/Operation.ts';
import { payToContract } from '../payToContract/payToContract.ts';

export const DepositData = Data.Tuple([
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

  // collateral ada
  Data.BigInt,
]);

const MINIMUM_COLLATERAL_ADA = Currency.ada(1_500_000n);

export const xyDeposit: Operation<
  [CfmmPool | WeightedPool | StablePool, [Currency, Currency]]
> =
  (pool, [x, y]) =>
  (context) => {
    const executorFeeWithTxFee = EXECUTOR_FEE.multiply(3n);
    const address = BaseAddress.from_address(
      Address.from_bech32(context.userAddress),
    );
    const estimatedLq = pool.convertAssetsToLp({
      x,
      y,
    });
    const depositScript =
      pool instanceof WeightedPool
        ? context.operationsConfig.operations.depositWeighted.script
        : pool instanceof StablePool
        ? context.operationsConfig.operations.depositStable.script
        : pool.cfmmType === 'feeSwitch'
        ? context.operationsConfig.operations.depositFeeSwitch.script
        : context.operationsConfig.operations.depositDefault.script;
    const depositAdaForLqBox = Currency.max([
      Output.new(context.pParams, {
        address: context.userAddress,
        value: Currencies.new([estimatedLq, x, y]),
      }).minAdaRequired,
      MINIMUM_COLLATERAL_ADA,
    ]);

    const outputValue = Currencies.new([
      x,
      y,
      executorFeeWithTxFee,
      depositAdaForLqBox,
    ]);
    const tmpData = DepositData([
      pool.nft,
      x.asset,
      y.asset,
      pool.lq.asset,
      executorFeeWithTxFee.amount,
      address?.payment().as_pub_key()?.to_hex()!,
      address?.stake().as_pub_key()?.to_hex(),
      depositAdaForLqBox.amount,
    ]);

    const depositAdaForOrder = predictDepositAda(context.pParams, {
      address: toContractAddress(
        context.network === 'mainnet'
          ? NetworkId.mainnet()
          : NetworkId.testnet(),
        depositScript,
      ),
      data: tmpData,
      value: outputValue,
    });

    const data = DepositData([
      pool.nft,
      x.asset,
      y.asset,
      pool.lq.asset,
      executorFeeWithTxFee.amount,
      address?.payment().as_pub_key()?.to_hex()!,
      address?.stake().as_pub_key()?.to_hex(),
      depositAdaForLqBox.plus(depositAdaForOrder).amount,
    ]);
    return payToContract(
      {
        script: depositScript,
        version: 'plutusV2',
      },
      outputValue.plus([depositAdaForOrder]),
      data,
    )(context);
  };

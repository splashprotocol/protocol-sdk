import {
  Address,
  BaseAddress,
  NetworkId,
} from '@dcspark/cardano-multiplatform-lib-browser';

import { Currencies } from '../../../../core/models/currencies/Currencies.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { EXECUTOR_FEE } from '../../../../core/utils/executorFee/executorFee.ts';
import { predictDepositAda } from '../../../../core/utils/predictDepositAdaForExecutor/predictDepositAda.ts';
import { scripts } from '../../../../core/utils/scripts/scripts.ts';
import { toContractAddress } from '../../../../core/utils/toContractAddress/toContractAddress.ts';
import { Operation } from '../common/Operation.ts';
import { payToContract } from '../payToContract/payToContract.ts';

const DepositData = Data.Tuple([
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

export const cfmmDeposit: Operation<[CfmmPool, [Currency, Currency]]> =
  (pool, [x, y]) =>
  (context) => {
    const address = BaseAddress.from_address(
      Address.from_bech32(context.userAddress),
    );
    // TODO: ADD ESTIMATED LQ
    const estimatedLq = pool.lq.withAmount(0n);
    const depositScript =
      pool.cfmmType === 'feeSwitch'
        ? scripts.deposit.feeSwitch
        : scripts.deposit.default;
    const depositAdaForLqBox = predictDepositAda(context.pParams, {
      address: context.userAddress,
      value: Currencies.new([estimatedLq, x, y]),
    });

    const outputValue = Currencies.new([
      x,
      y,
      EXECUTOR_FEE,
      depositAdaForLqBox,
    ]);
    const tmpData = DepositData([
      pool.nft,
      x.asset,
      y.asset,
      pool.lq.asset,
      EXECUTOR_FEE.amount,
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
      EXECUTOR_FEE.amount,
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

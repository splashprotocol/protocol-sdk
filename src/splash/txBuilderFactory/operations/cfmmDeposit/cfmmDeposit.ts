import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
import { CfmmPool } from '../../../../core/models/pool/cfmm/CfmmPool.ts';
import { Operation } from '../common/Operation.ts';
import { payToContract } from '../payToContract/payToContract.ts';

const mapScriptToPoolType = {
  default: '',
  feeSwitch: '',
  bidirectionalFees: '',
};

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
]);

export const cfmmDeposit: Operation<[CfmmPool, [Currency, Currency]]> =
  (pool, [x, y]) =>
  (context) => {
    const data = DepositData([
      pool.nft,
      x.asset,
      y.asset,
      pool.lq.asset,
      100n,
      '',
      undefined,
    ]);

    return payToContract(
      {
        script: mapScriptToPoolType.default,
        version: 'plutusV2',
      },
      [x, y],
      data,
    )(context);
  };

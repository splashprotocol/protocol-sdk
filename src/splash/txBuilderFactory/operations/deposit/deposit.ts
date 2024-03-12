import { AmmPool } from '../../../../core/models/ammPool/AmmPool.ts';
import { Currency } from '../../../../core/models/currency/Currency.ts';
import { Data } from '../../../../core/models/data/data.ts';
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

export const deposit: Operation<[AmmPool, [Currency, Currency]]> =
  (ammPool, [x, y]) =>
  (context) => {
    const data = DepositData([
      ammPool.id.asset,
      x.asset,
      y.asset,
      ammPool.lq.asset,
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

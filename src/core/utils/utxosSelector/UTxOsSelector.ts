import { Currencies } from '../../models/currencies/Currencies.ts';
import { Currency } from '../../models/currency/Currency.ts';
import { TransactionCandidate } from '../../models/transactionCandidate/TransactionCandidate.ts';
import { UTxO } from '../../models/utxo/UTxO.ts';
import { Dictionary, OutputReference } from '../../types/types.ts';
import { InsufficientFundsError } from './errors/InsufficientFundsError.ts';

interface UTxOsByCurrency {
  required: Currency;
  uTxOs: UTxO[];
}

interface SelectedUTxOs {
  uTxOs: { [key: string]: UTxO };
  required: Currencies;
  available: Currencies;
}

const selectUTxOsByAsset = (
  selectedUTxOs: SelectedUTxOs,
  uTxOsByCurrency: UTxOsByCurrency,
): SelectedUTxOs => {
  const required = uTxOsByCurrency.required;

  for (const uTxO of uTxOsByCurrency.uTxOs) {
    if (selectedUTxOs.uTxOs[uTxO.refHash]) {
      continue;
    }

    const available = selectedUTxOs.available.get(required.asset);
    if (available.gte(required)) {
      break;
    }

    selectedUTxOs.uTxOs[uTxO.refHash] = uTxO;
    selectedUTxOs.available = selectedUTxOs.available.plus(uTxO.value);
  }

  return selectedUTxOs;
};

const sortUTxOsByCurrency = (
  utxos: UTxO[],
  currency: Currency,
): UTxOsByCurrency => ({
  required: currency,
  uTxOs: utxos
    .filter((utxo) => utxo.value.get(currency.asset).isPositive())
    .sort((utxoA, utxoB) => {
      const currencyA = utxoA.value.get(currency.asset);
      const currencyB = utxoB.value.get(currency.asset);
      const currenciesCountA = utxoA.value.toArray().length;
      const currenciesCountB = utxoB.value.toArray().length;

      if (currenciesCountA === currenciesCountB) {
        return Number(currencyB.amount - currencyA.amount);
      }
      return currenciesCountA - currenciesCountB;
    }),
});

export interface UTxOsSelectorConfig {
  readonly uTxOs: UTxO[];
  readonly transactionCandidate?: TransactionCandidate;
}

export interface UTxOsSelectExtra {
  readonly exclude?: OutputReference[];
  readonly include?: OutputReference[];
}

/**
 * UTxOs selector
 */
export class UTxOsSelector {
  /**
   * Creates UTxOsSelector insatance
   * @param {UTxOsSelectorConfig} config
   * @return {UTxOsSelector}
   */
  static new(config: UTxOsSelectorConfig): UTxOsSelector {
    return new UTxOsSelector(config);
  }

  /**
   * Returns UTxOs by specified value
   * @param {Currencies} value
   * @param {UTxOsSelectExtra} extra
   */
  select(value: Currencies, extra?: UTxOsSelectExtra): UTxO[] {
    const include: UTxO[] = (extra?.include || [])
      .map((includeItem) =>
        this.uTxOs.find(
          (uTxO) =>
            uTxO.ref.index === includeItem.index &&
            uTxO.ref.txHash === includeItem.txHash,
        ),
      )
      .filter(
        (uTxoOrUndefined: UTxO | undefined): uTxoOrUndefined is UTxO =>
          !!uTxoOrUndefined,
      );
    const exclude: OutputReference[] = (
      this.transactionCandidate?.inputs.map((input) => input.uTxO.ref) || []
    ).concat(extra?.exclude || []);

    const nonAdaCurrencies = value.toArray().filter((item) => !item.isAda());
    const adaCurrencies = value.ada;

    const uTxOsToSelect = this.uTxOs.filter(
      (uTxO) =>
        !exclude.some(
          (uTxOToExclude) =>
            uTxO.ref.txHash === uTxOToExclude.txHash &&
            uTxO.ref.index === uTxOToExclude.index,
        ),
    );
    const sortedUTxOsByNonAda = nonAdaCurrencies.map((currency) =>
      sortUTxOsByCurrency(uTxOsToSelect, currency),
    );
    const sordedUTxOsByAda = sortUTxOsByCurrency(uTxOsToSelect, adaCurrencies);

    let selectedUtxos: SelectedUTxOs =
      sortedUTxOsByNonAda.reduce<SelectedUTxOs>(selectUTxOsByAsset, {
        available: include.reduce<Currencies>(
          (acc, uTxO) => acc.plus(uTxO.value),
          Currencies.empty,
        ),
        uTxOs: include.reduce<Dictionary<UTxO>>(
          (acc, uTxO) => ({
            ...acc,
            [uTxO.refHash]: uTxO,
          }),
          {},
        ),
        required: value,
      });
    selectedUtxos = selectUTxOsByAsset(selectedUtxos, sordedUTxOsByAda);

    if (selectedUtxos.available.isAssetsEnough(selectedUtxos.required)) {
      return Object.values(selectedUtxos.uTxOs);
    }
    throw new InsufficientFundsError(
      'not enough funds for specified selection',
    );
  }

  private transactionCandidate?: TransactionCandidate;

  private uTxOs: UTxO[];

  private constructor({ transactionCandidate, uTxOs }: UTxOsSelectorConfig) {
    this.transactionCandidate = transactionCandidate;
    this.uTxOs = uTxOs;
  }

  protected selectForTransactionBuilder(value: Currencies) {
    if (!this.transactionCandidate) {
      return this.select(value);
    }

    return this.select(value, {
      include: this.transactionCandidate.inputs.map((i) => i.uTxO.ref),
    });
  }
}

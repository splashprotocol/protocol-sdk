import { Currency } from '../../models/currency/Currency.ts';

export const TRANSACTION_FEE = Currency.ada(200_000n);

export const MAX_TRANSACTION_FEE = Currency.ada(500_000n);

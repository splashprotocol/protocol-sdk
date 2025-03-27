import { RemoteCollateralsConfig } from './RemoteCollateralsConfig.ts';
import { RemoteCollateral } from './RemoteCollateral.ts';
import { Transaction } from '../../models/Transaction/Transaction.ts';
import { CML } from '../../utils/Cml/Cml.ts';

/**
 * Splash remote collaterals service
 */
export class SplashRemoteCollaterals implements RemoteCollateralsConfig {
  static new(): SplashRemoteCollaterals {
    return new SplashRemoteCollaterals();
  }

  private url = 'https://collateral.splash.trade';

  private constructor() {}

  async getCollaterals(): Promise<RemoteCollateral[]> {
    return fetch(`${this.url}/collaterals`)
      .then((response: Response) => response.json())
      .then((data) => {
        return [
          {
            outputReferenceHash: data.collaterals[0],
            address: data.address,
          },
        ];
      })
      .catch(() => []);
  }

  async sign(transaction: Transaction): Promise<string> {
    const C = await CML;

    return fetch(`${this.url}/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        cbor: C.Transaction.from_cbor_hex(
          transaction.wasm.to_canonical_cbor_hex(),
        ).to_cbor_hex(),
      }),
    })
      .then((res) => res.json())
      .then((data) => data.witness);
  }
}

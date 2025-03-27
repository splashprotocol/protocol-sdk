import { Backend, BackendMethodArgument } from './common/Backend.ts';
import { BasicApi } from './common/BasicApi.ts';
import {
  CardanoCIP30WalletBridge,
  CardanoCIP30WalletContext,
} from '../types/CardanoCIP30WalletBridge.ts';
import { NoWalletError } from './errors/NoWalletError.ts';
import { InvalidWalletNetworkError } from './errors/InvalidWalletNetworkError.ts';
import { WalletEnablingError } from './errors/WalletEnablingError.ts';
import { WalletAccountError } from './errors/WalletAccountError.ts';
import { UserDeclinedSignError } from './errors/UserDeclinedSignError.ts';
import { WalletApiError } from './errors/WalletApiError.ts';
import { AddressUtils, CredentialType } from '@splashprotocol/core';

enum WalletNetworkId {
  TESTNET = 0,
  MAINNET = 1,
}

export type Api<B extends Backend<{}>> = BasicApi & {
  network: B['network'];
} & {
  [key in keyof Omit<Omit<B, 'network'>, 'getAssetMetadata'>]: (
    ...param: B[key] extends () => any
      ? []
      : B[key] extends (arg: BackendMethodArgument<null>) => any
        ? []
        : B[key] extends (arg: BackendMethodArgument<any>) => any
          ? [Parameters<B[key]>[0]['params']]
          : []
  ) => B[key] extends (...args: any[]) => any ? ReturnType<B[key]> : never;
};

export const createApi = <B extends Backend<{}>>(backend: B): Api<B> => {
  let selectedWallet:
    | undefined
    | (() => Promise<CardanoCIP30WalletContext>)
    | (() => CardanoCIP30WalletContext)
    | CardanoCIP30WalletBridge;
  let contextP: Promise<CardanoCIP30WalletContext> | undefined = undefined;

  const clearCache = () => {
    if (contextP) {
      contextP = undefined;
    }
  };
  const getContext = (): Promise<CardanoCIP30WalletContext> => {
    if (!selectedWallet) {
      clearCache();
      return Promise.reject(new NoWalletError('please, provide wallet to sdk'));
    }
    if (!contextP) {
      let timerId: any = undefined;
      contextP = Promise.race([
        Promise.resolve()
          .then(() =>
            selectedWallet instanceof Function
              ? selectedWallet()
              : selectedWallet!.enable(),
          )
          .then((ctx) =>
            ctx.getNetworkId().then((walletNetworkId) => {
              const selectedNetworkId =
                backend.network === 'mainnet'
                  ? WalletNetworkId.MAINNET
                  : WalletNetworkId.TESTNET;

              if (selectedNetworkId !== walletNetworkId) {
                throw new InvalidWalletNetworkError(
                  `Expected ${backend.network}`,
                );
              }
              return ctx;
            }),
          )
          .catch((err) => {
            if (err instanceof InvalidWalletNetworkError) {
              throw err;
            }
            throw new WalletEnablingError(
              err instanceof Error ? err.message : err,
            );
          }),
        new Promise((resolve) => {
          timerId = setTimeout(() => resolve(undefined), 60_000);
        }).then(() => {
          throw new WalletEnablingError('can`t enable wallet');
        }),
      ])
        .then((ctx) => {
          clearTimeout(timerId);
          return ctx;
        })
        .catch((err) => {
          clearCache();
          throw err;
        });
    }
    return contextP!;
  };

  const handleCIP30WalletError = async <T>(promise: Promise<T>): Promise<T> => {
    return promise.catch((err) => {
      clearCache();
      if (
        err instanceof WalletEnablingError ||
        err instanceof InvalidWalletNetworkError ||
        err instanceof NoWalletError
      ) {
        throw err;
      }
      console.log(err);
      // TODO: FIX FOR ALL WALLETS
      if (
        err?.message?.includes('account changed') ||
        err?.message?.includes('no account changed')
      ) {
        throw new WalletAccountError(err.message);
      }
      if (err?.message?.includes('user declined sign tx')) {
        throw new UserDeclinedSignError(err?.message);
      }

      throw new WalletApiError(
        err instanceof Error ? err.message : err?.info ? err.info : err,
      );
    });
  };

  const selectWallet = (
    walletFactory?:
      | (() => Promise<CardanoCIP30WalletContext>)
      | (() => CardanoCIP30WalletContext),
  ) => {
    clearCache();
    selectedWallet = walletFactory;
  };

  const getAddresses = () => {
    return getContext()
      .then((ctx) =>
        Promise.all([
          handleCIP30WalletError(ctx.getUnusedAddresses()),
          handleCIP30WalletError(ctx.getUsedAddresses()),
          handleCIP30WalletError(ctx.getChangeAddress()),
        ]),
      )
      .then(([unusedAddresses, usedAddresses, changeAddress]) =>
        unusedAddresses.concat(usedAddresses).concat([changeAddress]),
      )
      .then((addresses) =>
        addresses.map((cborAddressHex) =>
          AddressUtils.fromHex(cborAddressHex).toBech32(),
        ),
      );
  };

  const getPaymentKeysHashes = (): Promise<string[]> => {
    return getContext()
      .then((ctx) =>
        Promise.all([
          handleCIP30WalletError(ctx.getUnusedAddresses()),
          handleCIP30WalletError(ctx.getUsedAddresses()),
          handleCIP30WalletError(ctx.getChangeAddress()),
        ]),
      )
      .then(([unusedAddresses, usedAddresses, changeAddress]) =>
        unusedAddresses.concat(usedAddresses).concat([changeAddress]),
      )
      .then(
        (addresses) =>
          addresses
            .map((cborAddressHex) =>
              AddressUtils.fromHex(cborAddressHex).payment.type ===
              CredentialType.KeyHash
                ? AddressUtils.fromHex(cborAddressHex).payment.hash
                : undefined,
            )
            .filter(
              (pkhOrUndefined): pkhOrUndefined is string => !!pkhOrUndefined,
            ) as string[],
      )
      .then((pkhs) => Array.from(new Set(pkhs).values()));
  };

  const getActiveAddress = (): Promise<string> => {
    return getContext()
      .then((ctx) => handleCIP30WalletError(ctx.getChangeAddress()))
      .then((cborAddressHex) =>
        AddressUtils.fromHex(cborAddressHex).toBech32(),
      );
  };

  const getBalanceCbor = (): Promise<string> => {
    return getContext().then((ctx) => handleCIP30WalletError(ctx.getBalance()));
  };

  const innerApi = {
    selectWallet,
    getAddresses,
    getActiveAddress,
    getPaymentKeysHashes,
    getBalanceCbor,
    getWalletContext: getContext,
    handleCIP30WalletError: handleCIP30WalletError,
  };

  const backendCache = {};
  return new Proxy(innerApi, {
    get(target: BasicApi, prop: string) {
      if (prop === 'currentWalletFactory') {
        return selectedWallet;
      }
      if (prop === 'network') {
        return backend.network;
      }
      if (prop === 'backend') {
        return backend;
      }
      if (backend[prop]) {
        if (!backendCache[prop]) {
          backendCache[prop] = (args: any) => {
            return backend[prop]({ params: args, api: innerApi });
          };
        }
        return backendCache[prop];
      }
      return target[prop];
    },
  }) as any;
};

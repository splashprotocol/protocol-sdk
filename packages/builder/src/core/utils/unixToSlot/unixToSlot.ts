import { Network } from '@splashprotocol/sdk';

const MAINNET_MAGIC_NUMBER = 1591566291n;

const PREPROD_MAGIC_NUMBER = 1655683239n;

export const unixToSlot = (network: Network, timeStamp: bigint): bigint => {
  if (network === 'mainnet') {
    return timeStamp - MAINNET_MAGIC_NUMBER;
  } else {
    return timeStamp - PREPROD_MAGIC_NUMBER;
  }
};

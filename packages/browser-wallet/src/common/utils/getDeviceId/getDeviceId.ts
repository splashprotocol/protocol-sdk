import {
  getFingerprintHash,
  setOption,
} from '@guardhivefraudshield/device-fingerprint';

setOption('exclude', ['permissions']);

export const getDeviceId = async () => {
  return getFingerprintHash();
};

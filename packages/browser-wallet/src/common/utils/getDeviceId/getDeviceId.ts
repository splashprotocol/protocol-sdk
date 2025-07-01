import { getFingerprintData } from '@guardhivefraudshield/device-fingerprint';
import { sha1 } from 'object-hash';

export const getDeviceId = async () => {
  return getFingerprintData().then((data) => {
    return sha1({
      audio: data.audio,
      canvas: data.canvas,
      deviceName: data.deviceName,
      hardware: data.hardware,
      locales: data.locales,
      webgl: data.webgl,
    });
  });
};

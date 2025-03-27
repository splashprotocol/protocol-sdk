//need for next js framework
export const CML = process.env.SPLASH_NEXT_JS
  ? import('@dcspark/cardano-multiplatform-lib-browser')
  : typeof window === 'undefined'
    ? import('@dcspark/cardano-multiplatform-lib-nodejs')
    : !navigator.userAgent.startsWith('Deno')
      ? import('@dcspark/cardano-multiplatform-lib-browser')
      : import('@dcspark/cardano-multiplatform-lib-nodejs');

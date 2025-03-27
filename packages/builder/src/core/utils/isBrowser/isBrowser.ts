/**
 * Check if lib loaded in browser
 * @returns {boolean}
 */
export const isBrowser = (): boolean => {
  // need for next_js framework
  if (process.env.SPLASH_NEXT_JS) {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return !navigator.userAgent.startsWith('Deno');
  } catch {
    return false;
  }
};

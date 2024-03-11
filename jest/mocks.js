jest.mock(
  '@emurgo/cardano-serialization-lib-browser',
  () => require('@emurgo/cardano-serialization-lib-nodejs'),
  { virtual: true },
);
jest.mock(
  '@dcspark/cardano-multiplatform-lib-browser',
  () => require('@dcspark/cardano-multiplatform-lib-nodejs'),
  { virtual: true },
);

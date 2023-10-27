jest.mock(
  '@emurgo/cardano-serialization-lib-browser',
  () => require('@emurgo/cardano-serialization-lib-nodejs'),
  { virtual: true },
);

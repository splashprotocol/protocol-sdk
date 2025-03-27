import { spotOrderBeacon } from './spotOrderBeacon.ts';

test('it should create valid beacon from datum', async () => {
  const expectedBeacon =
    '384dc40d3a4361798c5b9eba65245ce972c6b6807034ab51b098d573';
  const res = await spotOrderBeacon(
    {
      txHash:
        '02b493cbd8eb40c3d5ed58372949c6d7c48afcf77416cf25189b118f53af19a4',
      index: 1n,
    },
    0n,
    {
      type: '00',
      beacon: '00000000000000000000000000000000000000000000000000000000',
      inputAsset: { policyId: '', name: '' },
      inputAmount: 1000000n,
      costPerExStep: 900000n,
      minMarginalOutput: 138502n,
      outputAsset: {
        policyId: 'cebbd6a8ca954b7fc7a346d0baed4182e0358059f38065de279fb822',
        name: '43617264616e6f20436174',
      },
      price: {
        numerator: 13850243829651554n,
        denominator: 100000000000000000n,
      },
      executorFee: 0n,
      address: {
        paymentCredentials: {
          paymentKeyHash:
            '74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430',
        },
        stakeCredentials: {
          paymentKeyHash:
            'de7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f',
        },
      },
      cancelPkh: '74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430',
      permittedExecutors: [
        '5cb2c968e5d1c7197a6ce7615967310a375545d9bc65063a964335b2',
      ],
    },
  );

  expect(res).toBe(expectedBeacon);
});

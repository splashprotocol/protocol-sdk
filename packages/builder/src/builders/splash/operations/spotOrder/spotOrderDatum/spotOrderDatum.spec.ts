import { spotOrderDatum } from './spotOrderDatum.ts';
import { InferDatum } from '../../../../../core/models/Datum/Datum.ts';

test('it should serialize object to valid datum', async () => {
  const expectedCbor =
    'd8798c4100581c73fc8e44a4c04433c4e5870982e7d94867e9be28e501bff03e4ac0cfd87982581cfb4f75d1ad4eb5c21efd5a32a90c076e63a79daccf25afe4ccd4f7144824504f50534e454b1a000f3c391a000dbba01a0ee0cfaad879824040d879821903e80100d87982d87981581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d87981d87981d87981581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d9115349643081581c5cb2c968e5d1c7197a6ce7615967310a375545d9bc65063a964335b2';
  const res = await spotOrderDatum.serialize({
    type: '00',
    beacon: '73fc8e44a4c04433c4e5870982e7d94867e9be28e501bff03e4ac0cf',
    inputAsset: {
      policyId: 'fb4f75d1ad4eb5c21efd5a32a90c076e63a79daccf25afe4ccd4f714',
      name: '24504f50534e454b',
    },
    inputAmount: 998457n,
    costPerExStep: 900000n,
    minMarginalOutput: 249614250n,
    outputAsset: {
      policyId: '',
      name: '',
    },
    price: {
      numerator: 1000n,
      denominator: 1n,
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
  });

  expect(res).toBe(expectedCbor);
});

test('it should deserialize cbor to valid object', async () => {
  const cborToDeserialize =
    'd8798c4100581c73fc8e44a4c04433c4e5870982e7d94867e9be28e501bff03e4ac0cfd87982581cfb4f75d1ad4eb5c21efd5a32a90c076e63a79daccf25afe4ccd4f7144824504f50534e454b1a000f3c391a000dbba01a0ee0cfaad879824040d879821903e80100d87982d87981581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d87981d87981d87981581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d9115349643081581c5cb2c968e5d1c7197a6ce7615967310a375545d9bc65063a964335b2';
  const expectedObj: InferDatum<typeof spotOrderDatum> = {
    type: '00',
    beacon: '73fc8e44a4c04433c4e5870982e7d94867e9be28e501bff03e4ac0cf',
    inputAsset: {
      policyId: 'fb4f75d1ad4eb5c21efd5a32a90c076e63a79daccf25afe4ccd4f714',
      name: '24504f50534e454b',
    },
    inputAmount: 998457n,
    costPerExStep: 900000n,
    minMarginalOutput: 249614250n,
    outputAsset: {
      policyId: '',
      name: '',
    },
    price: {
      numerator: 1000n,
      denominator: 1n,
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
  };

  const res = await spotOrderDatum.deserialize(cborToDeserialize);

  expect(res.type).toBe(expectedObj.type);
  expect(res.beacon).toBe(expectedObj.beacon);
  expect(res.inputAsset.policyId).toBe(expectedObj.inputAsset.policyId);
  expect(res.inputAsset.name).toBe(expectedObj.inputAsset.name);
  expect(res.inputAmount).toBe(expectedObj.inputAmount);
  expect(res.minMarginalOutput).toBe(expectedObj.minMarginalOutput);
  expect(res.executorFee).toBe(expectedObj.executorFee);
  expect(res.costPerExStep).toBe(expectedObj.costPerExStep);
  expect(res.outputAsset.policyId).toBe(expectedObj.outputAsset.policyId);
  expect(res.outputAsset.name).toBe(expectedObj.outputAsset.name);
  expect(res.cancelPkh).toBe(expectedObj.cancelPkh);
  expect(res.price.numerator).toBe(expectedObj.price.numerator);
  expect(res.price.denominator).toBe(expectedObj.price.denominator);
  // @ts-ignore
  expect(res.address.paymentCredentials.paymentKeyHash).toBe(
    // @ts-ignore
    expectedObj.address.paymentCredentials.paymentKeyHash,
  );
  // @ts-ignore
  expect(res.address.stakeCredentials.paymentKeyHash).toBe(
    // @ts-ignore
    expectedObj.address.stakeCredentials.paymentKeyHash,
  );
  expect(res.permittedExecutors).toBeInstanceOf(Array);
  expect(res.permittedExecutors[0]).toBe(expectedObj.permittedExecutors[0]);
  expect(await spotOrderDatum.serialize(res)).toBe(cborToDeserialize);
});

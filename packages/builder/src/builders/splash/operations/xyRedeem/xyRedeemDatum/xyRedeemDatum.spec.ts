import { xyRedeemDatum } from './xyRedeemDatum.ts';

test('it should correct serialize redeem datum', async () => {
  const res = await xyRedeemDatum.serialize({
    nft: {
      policyId: 'ad876d76b453e6c4e4f427717a4afc57439a988d8e4a1eb57f543446',
      name: '5351554952545f4144415f4e4654',
    },
    x: {
      policyId: '',
      name: '',
    },
    y: {
      policyId: '5ac3d4bdca238105a040a565e5d7e734b7c9e1630aec7650e809e34a',
      name: '535155495254',
    },
    lq: {
      policyId: '610140406c24c52d4e630b022201d36d2b1ba0d044237d7bd138d33d',
      name: '5351554952545f4144415f4c51',
    },
    exFee: 1500000n,
    pkh: '74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430',
    skh: 'de7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f',
  });

  expect(res).toBe(
    'd87987d87982581cad876d76b453e6c4e4f427717a4afc57439a988d8e4a1eb57f5434464e5351554952545f4144415f4e4654d879824040d87982581c5ac3d4bdca238105a040a565e5d7e734b7c9e1630aec7650e809e34a46535155495254d87982581c610140406c24c52d4e630b022201d36d2b1ba0d044237d7bd138d33d4d5351554952545f4144415f4c511a0016e360581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d87981581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f',
  );
});

test('it should correct deserialize redeem datum', async () => {
  const res = await xyRedeemDatum.deserialize(
    'd8799fd8799f581cad876d76b453e6c4e4f427717a4afc57439a988d8e4a1eb57f5434464e5351554952545f4144415f4e4654ffd8799f4040ffd8799f581c5ac3d4bdca238105a040a565e5d7e734b7c9e1630aec7650e809e34a46535155495254ffd8799f581c610140406c24c52d4e630b022201d36d2b1ba0d044237d7bd138d33d4d5351554952545f4144415f4c51ff1a0016e360581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d8799f581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450fffff',
  );

  expect(res.nft.policyId).toBe(
    'ad876d76b453e6c4e4f427717a4afc57439a988d8e4a1eb57f543446',
  );
  expect(res.nft.name).toBe('5351554952545f4144415f4e4654');

  expect(res.x.policyId).toBe('');
  expect(res.x.name).toBe('');

  expect(res.y.policyId).toBe(
    '5ac3d4bdca238105a040a565e5d7e734b7c9e1630aec7650e809e34a',
  );
  expect(res.y.name).toBe('535155495254');

  expect(res.lq.policyId).toBe(
    '610140406c24c52d4e630b022201d36d2b1ba0d044237d7bd138d33d',
  );
  expect(res.lq.name).toBe('5351554952545f4144415f4c51');
  expect(res.exFee).toBe(1500000n);
  expect(res.pkh).toBe(
    '74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430',
  );
  expect(res.skh).toBe(
    'de7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f',
  );
});

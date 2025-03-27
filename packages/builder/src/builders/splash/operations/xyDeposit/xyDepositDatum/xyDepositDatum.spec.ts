import { xyDepositDatum } from './xyDepositDatum.ts';

test('it should correct serialize deposit datum', async () => {
  const res = await xyDepositDatum.serialize({
    nft: {
      policyId: 'a80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf',
      name: '5350465f4144415f4e4654',
    },
    x: {
      policyId: '',
      name: '',
    },
    y: {
      policyId: '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
      name: '535046',
    },
    lq: {
      policyId: '74f47c99ac793c29280575b08fe20c7fb75543bff5b1581f7c162e7c',
      name: '5350465f4144415f4c51',
    },
    exFee: 1500000n,
    pkh: '74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430',
    skh: 'de7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f',
    collateralAda: 1500000n,
  });

  expect(res).toBe(
    'd87988d87982581ca80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf4b5350465f4144415f4e4654d879824040d87982581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e7543535046d87982581c74f47c99ac793c29280575b08fe20c7fb75543bff5b1581f7c162e7c4a5350465f4144415f4c511a0016e360581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d87981581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f1a0016e360',
  );
});

test('it should correct deserialize deposit datum', async () => {
  const res = await xyDepositDatum.deserialize(
    'd8799fd8799f581ca80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf4b5350465f4144415f4e4654ffd8799f4040ffd8799f581c09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e7543535046ffd8799f581c74f47c99ac793c29280575b08fe20c7fb75543bff5b1581f7c162e7c4a5350465f4144415f4c51ff1a0016e360581c74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430d8799f581cde7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450fff1a0016e360ff',
  );

  expect(res.nft.policyId).toBe(
    'a80022230c821a52e426d2fdb096e7d967b5ab25d350d469a7603dbf',
  );
  expect(res.nft.name).toBe('5350465f4144415f4e4654');
  expect(res.x.policyId).toBe('');
  expect(res.x.name).toBe('');
  expect(res.y.policyId).toBe(
    '09f2d4e4a5c3662f4c1e6a7d9600e9605279dbdcedb22d4507cb6e75',
  );
  expect(res.y.name).toBe('535046');
  expect(res.lq.policyId).toBe(
    '74f47c99ac793c29280575b08fe20c7fb75543bff5b1581f7c162e7c',
  );
  expect(res.lq.name).toBe('5350465f4144415f4c51');
  expect(res.exFee).toBe(1500000n);
  expect(res.pkh).toBe(
    '74104cd5ca6288c1dd2e22ee5c874fdcfc1b81897462d91153496430',
  );
  expect(res.skh).toBe(
    'de7866fe5068ebf3c87dcdb568da528da5dcb5f659d9b60010e7450f',
  );
  expect(res.collateralAda).toBe(1500000n);
});

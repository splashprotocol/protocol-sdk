import { createCfmmPoolDatum } from './createCfmmPoolDatum.ts';

test('it should serialize cfmm pool object to valid datum', async () => {
  const res = await createCfmmPoolDatum.serialize({
    nft: {
      policyId: '7d7ed2d5a57d4fdb153c3e396fe96a9cb0f3231db3c89a4840f1fdd4',
      name: '53504c4153485f4144415f4e4654',
    },
    x: {
      policyId: '',
      name: '',
    },
    y: {
      policyId: 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3',
      name: '53504c415348',
    },
    lq: {
      policyId: '8d1a5b3e703e56dca2be8be7ee61e02dda2486f2614b034ae6529acd',
      name: '53504c4153485f4144415f4c51',
    },
    poolFee: 99730n,
    treasuryFee: 30n,
    treasuryX: 0n,
    treasuryY: 0n,
    dao: [
      {
        scriptHash: 'ddaf0642968c2bc57e59613fe6bc6e4706e2cb097afa09efd2826fb5',
      },
    ],
    treasury: '75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
    lqBound: 0n,
  });

  expect(res).toBe(
    'd8799fd8799f581c7d7ed2d5a57d4fdb153c3e396fe96a9cb0f3231db3c89a4840f1fdd44e53504c4153485f4144415f4e4654ffd8799f4040ffd8799f581cececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e34653504c415348ffd8799f581c8d1a5b3e703e56dca2be8be7ee61e02dda2486f2614b034ae6529acd4d53504c4153485f4144415f4c51ff1a00018592181e00009fd8799fd87a9f581cddaf0642968c2bc57e59613fe6bc6e4706e2cb097afa09efd2826fb5ffffff00581c75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133ff',
  );
});

test('it should deserialize cfmm pool cbor to valid object', async () => {
  const res = await createCfmmPoolDatum.deserialize(
    'd8799fd8799f581c7d7ed2d5a57d4fdb153c3e396fe96a9cb0f3231db3c89a4840f1fdd44e53504c4153485f4144415f4e4654ffd8799f4040ffd8799f581cececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e34653504c415348ffd8799f581c8d1a5b3e703e56dca2be8be7ee61e02dda2486f2614b034ae6529acd4d53504c4153485f4144415f4c51ff1a00018592181e00009fd8799fd87a9f581cddaf0642968c2bc57e59613fe6bc6e4706e2cb097afa09efd2826fb5ffffff00581c75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133ff',
  );

  expect(res.nft.policyId).toBe(
    '7d7ed2d5a57d4fdb153c3e396fe96a9cb0f3231db3c89a4840f1fdd4',
  );
  expect(res.nft.name).toBe('53504c4153485f4144415f4e4654');

  expect(res.x.policyId).toBe('');
  expect(res.x.name).toBe('');

  expect(res.y.policyId).toBe(
    'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3',
  );
  expect(res.y.name).toBe('53504c415348');

  expect(res.lq.policyId).toBe(
    '8d1a5b3e703e56dca2be8be7ee61e02dda2486f2614b034ae6529acd',
  );
  expect(res.lq.name).toBe('53504c4153485f4144415f4c51');

  expect(res.poolFee).toBe(99730n);
  expect(res.treasuryFee).toBe(30n);
  expect(res.treasuryX).toBe(0n);
  expect(res.treasuryY).toBe(0n);
  // @ts-ignore
  expect(res.dao[0].scriptHash).toBe(
    'ddaf0642968c2bc57e59613fe6bc6e4706e2cb097afa09efd2826fb5',
  );
  expect(res.lqBound).toBe(0n);
  expect(res.treasury).toBe(
    '75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
  );
});

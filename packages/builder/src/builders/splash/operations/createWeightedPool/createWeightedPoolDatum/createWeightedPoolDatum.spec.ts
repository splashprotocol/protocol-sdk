import { createWeightedPoolDatum } from './createWeightedPoolDatum.ts';

test('it should serialize weighted pool object to valid datum', async () => {
  const res = await createWeightedPoolDatum.serialize({
    nft: {
      policyId: '74a05af540a8a504fc11e907c6eb204ec8d0e898c0093aca1b8a164a',
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
      policyId: 'ed47f9110ace85f69fb61ba0044a8749fbfbf0b9a3d4b195fd013657',
      name: '53504c4153485f4144415f4c51',
    },
    poolFee: 99700n,
    treasuryFee: 30n,
    treasuryX: 0n,
    treasuryY: 0n,
    dao: [
      {
        scriptHash: '6f240631775c1213bf0ee46e7f6ab21464dbd60057a9bc21a6cb1e0c',
      },
    ],
    address: '75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
  });

  expect(res).toBe(
    'd8798ad87982581c74a05af540a8a504fc11e907c6eb204ec8d0e898c0093aca1b8a164a4e53504c4153485f4144415f4e4654d879824040d87982581cececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e34653504c415348d87982581ced47f9110ace85f69fb61ba0044a8749fbfbf0b9a3d4b195fd0136574d53504c4153485f4144415f4c511a00018574181e000081d87981d87a81581c6f240631775c1213bf0ee46e7f6ab21464dbd60057a9bc21a6cb1e0c581c75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
  );
});

test('it should deserialize weighted pool cbor to valid object', async () => {
  const res = await createWeightedPoolDatum.deserialize(
    'd8799fd8799f581c74a05af540a8a504fc11e907c6eb204ec8d0e898c0093aca1b8a164a4e53504c4153485f4144415f4e4654ffd8799f4040ffd8799f581cececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e34653504c415348ffd8799f581ced47f9110ace85f69fb61ba0044a8749fbfbf0b9a3d4b195fd0136574d53504c4153485f4144415f4c51ff1a00018574181e00009fd8799fd87a9f581c6f240631775c1213bf0ee46e7f6ab21464dbd60057a9bc21a6cb1e0cffffff581c75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133ff',
  );

  expect(res.nft.policyId).toBe(
    '74a05af540a8a504fc11e907c6eb204ec8d0e898c0093aca1b8a164a',
  );
  expect(res.nft.name).toBe('53504c4153485f4144415f4e4654');

  expect(res.x.policyId).toBe('');
  expect(res.x.name).toBe('');

  expect(res.y.policyId).toBe(
    'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3',
  );
  expect(res.y.name).toBe('53504c415348');

  expect(res.lq.policyId).toBe(
    'ed47f9110ace85f69fb61ba0044a8749fbfbf0b9a3d4b195fd013657',
  );
  expect(res.lq.name).toBe('53504c4153485f4144415f4c51');

  expect(res.poolFee).toBe(99700n);
  expect(res.treasuryFee).toBe(30n);
  expect(res.treasuryX).toBe(0n);
  expect(res.treasuryY).toBe(0n);
  // @ts-ignore
  expect(res.dao[0].scriptHash).toBe(
    '6f240631775c1213bf0ee46e7f6ab21464dbd60057a9bc21a6cb1e0c',
  );
  expect(res.address).toBe(
    '75c4570eb625ae881b32a34c52b159f6f3f3f2c7aaabf5bac4688133',
  );
});

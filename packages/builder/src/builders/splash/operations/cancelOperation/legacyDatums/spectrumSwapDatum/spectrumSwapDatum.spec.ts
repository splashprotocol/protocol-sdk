import { spectrumSwapDatum } from './spectrumSwapDatum.ts';

test('it should correct deserialize cbor', async () => {
  const data = await spectrumSwapDatum.deserialize(
    'd8799fd8799f4040ffd8799f581c04b95368393c821f180deee8229fbd941baaf9bd748ebcdbf7adbb14457273455247ffd8799f581cdb73d7b28075e8869bb862857ded32d9b6fe9420d95aa94f5d34f80a4d72734552475f4144415f4e4654ff1903de1b00000059ff8bbd6a1b016345785d8a0000581c83f55e6f42d6730d6b66c6c9566d5c307b119b8d6907a25841d8bbaad8799f581c196d9fb5061b3a658eae958c155405014b1a01c60744c57241e0a374ff1a2e1646bf1b0000005a5a1a2defff',
  );

  expect(data.base.policyId).toBe('');
  expect(data.base.name).toBe('');

  expect(data.quote.policyId).toBe(
    '04b95368393c821f180deee8229fbd941baaf9bd748ebcdbf7adbb14',
  );
  expect(data.quote.name).toBe('7273455247');

  expect(data.poolNft.policyId).toBe(
    'db73d7b28075e8869bb862857ded32d9b6fe9420d95aa94f5d34f80a',
  );
  expect(data.poolNft.name).toBe('72734552475f4144415f4e4654');

  expect(data.feeNum).toBe(990n);
  expect(data.feePerTokenNum).toBe(386539437418n);
  expect(data.feePerTokenDenom).toBe(100000000000000000n);
  expect(data.rewardPkh).toBe(
    '83f55e6f42d6730d6b66c6c9566d5c307b119b8d6907a25841d8bbaa',
  );
  expect(data.stakePkh).toBe(
    '196d9fb5061b3a658eae958c155405014b1a01c60744c57241e0a374',
  );
  expect(data.baseAmount).toBe(773211839n);
  expect(data.minQuoteAmount).toBe(388058721775n);
});

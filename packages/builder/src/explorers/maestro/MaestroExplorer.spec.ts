import { MaestroExplorer } from './MaestroExplorer.ts';
import { UTxO } from '../../core/models/UTxO/UTxO.ts';

const maestroExplorer = MaestroExplorer.new('mainnet', process.env.MAESTRO_API_KEY!,);

test('it should be valid instance of blockfrost explorer', () => {
  expect(maestroExplorer).toBeInstanceOf(MaestroExplorer);
  expect(maestroExplorer.network).toBe('mainnet');
});

test('it should returns valid protocol params', async () => {
  const pParams = await maestroExplorer.getProtocolParams();
  expect(pParams).toBeInstanceOf(Object);
});

test('it should returns valid network context', async () => {
  const nContext = await maestroExplorer.getNetworkContext();
  expect(nContext).toBeInstanceOf(Object);
});

test('it returns valid UTxO', async () => {
  const uTxO = await maestroExplorer.getUTxOByRef({
    txHash: 'b91eda29d145ab6c0bc0d6b7093cb24b131440b7b015033205476f39c690a51f',
    index: 0n,
  });
  expect(uTxO).toBeInstanceOf(UTxO);
  expect(uTxO?.txHash).toBe(
    'b91eda29d145ab6c0bc0d6b7093cb24b131440b7b015033205476f39c690a51f',
  );
  expect(uTxO?.index).toBe(0n);
  expect(uTxO?.value.ada.amount).toBe(5534040n);
  expect(uTxO?.spent).toBe(false);
});

test('it returns valid UTxOs', async () => {
  const uTxOs = await maestroExplorer.getUTxOsByAddress(
    'addr1q8q52qfu4g4ecc9vjf0d94j5c8zslupwlatudf2772480x4up79cfn34x5m56g4k534d06mvqg8ml5jle9hmjlgh46pqnc469w',
  );

  expect(uTxOs).toBeInstanceOf(Array);
  expect(uTxOs[0].txHash).toBe(
    'e12e93f73576d3c1a24cc2f3ee286bf2b77e391b465f092b88d50ae4c77c41d8',
  );
  expect(uTxOs[0].index).toBe(0n);
  expect(uTxOs[0].value.ada.amount).toBe(1211110n);
  expect(uTxOs[0].spent).toBe(false);
});

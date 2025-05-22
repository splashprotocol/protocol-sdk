import {
  ConstrPlutusData,
  PlutusData,
  PlutusDataList,
  PlutusV3Script,
} from '@dcspark/cardano-multiplatform-lib-browser';

import {
  CborHexString,
  TransactionHash,
} from '../../../../core/types/types.ts';

interface GetPolicyAndScriptParams {
  readonly txHash: TransactionHash;
  readonly index: bigint;
}
export interface GetPolicyAndScriptResult {
  readonly policyId: CborHexString;
  readonly script: CborHexString;
  readonly redeemer: PlutusData;
}

const ANY_TOKEN_MINTING_SCRIPT_SCRIPT_TEMPLATE =
  '5901fc0101003229800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400130080024888966002600460106ea800e2646644b300130050018acc004c030dd5003c00a2c806a2b30013370e9001000c56600260186ea801e00516403516402880504cc8966002600a60166ea801e2b30013005300b375464660020026eb0c040c034dd5002912cc0040062980103d87a80008992cc004cdd7980918079baa001015899ba548000cc0440052f5c1133003003301300240346022002807a266002004466e2120000018b2014899800801119b880014800100a1919800800992cc004cdc3a400460166ea8006297adef6c6089bab300f300c37540028050c8cc004004dd59807980818081808180818061baa0042259800800c530103d87a8000899192cc004cdc8803000c56600266e3c018006266e95200033011300f0024bd7045300103d87a80004035133004004301300340346eb8c034004c04000500e112cc004006297ae089980718061807800998010011808000a01a2232330010010032259800800c528c56600260066eb4c044006266004004602400314a0806100f18049baa005375c601860126ea800e2c8038601000260066ea802229344d959001130127d8799f5820[TX_HASH][INDEX]ff0001';

export const getPolicyAndScript = async ({
  txHash,
  index,
}: GetPolicyAndScriptParams): Promise<GetPolicyAndScriptResult> => {
  const normalizedIndex =
    index.toString().length === 1 ? `0${index}` : index.toString();

  const scriptDoubleCbor = ANY_TOKEN_MINTING_SCRIPT_SCRIPT_TEMPLATE.replace(
    `[TX_HASH]`,
    txHash,
  ).replace('[INDEX]', normalizedIndex);
  const script = PlutusV3Script.from_hex(scriptDoubleCbor);

  return {
    script: script.to_cbor_hex(),
    policyId: script.hash().to_hex(),
    redeemer: PlutusData.new_constr_plutus_data(
      ConstrPlutusData.new(0n, PlutusDataList.new()),
    ).to_cardano_node_format(),
  };
};

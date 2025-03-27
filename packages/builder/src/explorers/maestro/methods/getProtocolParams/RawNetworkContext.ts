export interface RawNetworkContext {
  data: {
    hash: string;
    height: number;
    absolute_slot: number;
    timestamp: string;
    epoch: number;
    epoch_slot: number;
    block_producer: string;
    confirmations: string;
    tx_hashes: [];
    total_fees: number;
    total_ex_units: { mem: number; steps: number };
    script_invocations: number;
    size: number;
    previous_block: string;
    next_block: string | null;
    total_output_lovelace: string;
    era: string;
    protocol_version: [9, 1];
    vrf_key: string;
    operational_certificate: {
      hot_vkey: string;
      sequence_number: number;
      kes_period: number;
      kes_signature: string;
    };
  };
  last_updated: {
    timestamp: string;
    block_hash: string;
    block_slot: number;
  };
}

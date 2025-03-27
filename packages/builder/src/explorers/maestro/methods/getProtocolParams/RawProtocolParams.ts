export interface RawProtocolParams {
  data: {
    min_fee_coefficient: number;
    min_fee_constant: { ada: { lovelace: number } };
    min_fee_reference_scripts: {
      base: number;
      range: number;
      multiplier: number;
    };
    max_block_body_size: { bytes: number };
    max_block_header_size: { bytes: number };
    max_transaction_size: { bytes: number };
    max_reference_scripts_size: { bytes: number };
    stake_credential_deposit: { ada: { lovelace: number } };
    stake_pool_deposit: { ada: { lovelace: number } };
    stake_pool_retirement_epoch_bound: number;
    desired_number_of_stake_pools: number;
    stake_pool_pledge_influence: string;
    monetary_expansion: string;
    treasury_expansion: string;
    min_stake_pool_cost: { ada: { lovelace: number } };
    min_utxo_deposit_constant: { ada: { lovelace: number } };
    min_utxo_deposit_coefficient: number;
    plutus_cost_models: {
      plutus_v1: [];
      plutus_v2: [];
      plutus_v3: [];
    };
    script_execution_prices: { memory: string; cpu: string };
    max_execution_units_per_transaction: { memory: number; cpu: number };
    max_execution_units_per_block: { memory: number; cpu: number };
    max_value_size: { bytes: number };
    collateral_percentage: number;
    max_collateral_inputs: number;
    version: { major: number; minor: number };
    stake_pool_voting_thresholds: {
      no_confidence: string;
      constitutional_committee: [Object];
      hard_fork_initiation: '51/100';
      protocol_parameters_update: [Object];
    };
    delegate_representative_voting_thresholds: {
      no_confidence: '67/100';
      constitutional_committee: [Object];
      constitution: '3/4';
      hard_fork_initiation: '3/5';
      protocol_parameters_update: [Object];
      treasury_withdrawals: '67/100';
    };
    constitutional_committee_min_size: number;
    constitutional_committee_max_term_length: number;
    governance_action_lifetime: number;
    governance_action_deposit: { ada: { lovelace: number } };
    delegate_representative_deposit: { ada: { lovelace: number } };
    delegate_representative_max_idle_time: number;
  };
  last_updated: {
    timestamp: string;
    block_hash: string;
    block_slot: number;
  };
}

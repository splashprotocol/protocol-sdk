export enum AddressKind {
  BasePaymentKeyStakeKey = 0b0000,
  BasePaymentScriptStakeKey = 0b0001,
  BasePaymentKeyStakeScript = 0b0010,
  BasePaymentScriptStakeScript = 0b0011,
  PointerKey = 0b0100,
  PointerScript = 0b0101,
  EnterpriseKey = 0b0110,
  EnterpriseScript = 0b0111,
  // 0b1000 was chosen because all existing Byron addresses actually start with 0b1000,
  // therefore we can re-use Byron addresses as-is
  Byron = 0b1000,
  RewardKey = 0b1110,
  RewardScript = 0b1111,
  // 1001-1101 are left for future formats
}

import { ProtocolParams } from '../types/ProtocolParams.ts';

export interface Explorer {
  getProtocolParams(): Promise<ProtocolParams>;
}

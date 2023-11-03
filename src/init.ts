import { Explorer } from './core/explorer/Explorer.ts';
import { ProtocolParams } from './core/types/ProtocolParams.ts';

let _explorer: Explorer | undefined;

export const getProtocolParams = async (): Promise<ProtocolParams> => {
  if (!_explorer) {
    throw new Error(
      'sdk now initialized. You should call init method in index.ts',
    );
  }
  // TODO: write time optimization
  return _explorer.getProtocolParams();
};

export const init = (explorer: Explorer): void => {
  _explorer = explorer;
};

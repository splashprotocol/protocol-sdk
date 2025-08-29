export interface BrowserWalletConfig {
  readonly walletUrl: string;
  readonly uTxOMonitorUrl: string;
  readonly submitUrl: string;
  readonly tradeSessionCheck: () => Promise<void>;
}

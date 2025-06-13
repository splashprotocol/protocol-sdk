export interface AnomalyAnalyzerConfig {
  readonly maxErrorCount: number;
  readonly maxRps: number;
  readonly onAnomalyDetected: () => void;
}

export class AnomalyAnalyzer {
  static create(config: AnomalyAnalyzerConfig) {
    return new AnomalyAnalyzer(config);
  }

  private errorCount: number = 0;

  private intervalId: any;

  private rpsCount: number = 0;

  readonly destroyed = false;

  private constructor(private config: AnomalyAnalyzerConfig) {
    this.intervalId = setInterval(() => {
      this.rpsCount = 0;
    });
  }

  asserError(): boolean {
    if (this.destroyed) {
      throw new Error('AnomalyAnalyzer ended');
    }
    this.errorCount += 1;
    if (this.errorCount >= this.config.maxErrorCount) {
      this.destroy();
      this.config.onAnomalyDetected();
      return false;
    }
    return true;
  }

  assertRequest(): boolean {
    if (this.destroyed) {
      throw new Error('AnomalyAnalyzer ended');
    }
    this.rpsCount += 1;
    if (this.rpsCount >= this.config.maxRps) {
      this.destroy();
      this.config.onAnomalyDetected();
      return false;
    }
    return true;
  }

  async applyToValidator(validator: () => Promise<true> | true) {
    if (this.destroyed) {
      throw new Error('AnomalyAnalyzer ended');
    }
    if (!this.assertRequest()) {
      throw new Error('Error anomaly detected');
    }
    try {
      await validator();
    } catch (error: unknown) {
      this.asserError();
      throw error;
    }
  }

  destroy() {
    if (this.destroyed) {
      throw new Error('AnomalyAnalyzer already destroyed');
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

import {
  HistoryCallback,
  IDatafeedChartApi,
  IExternalDatafeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
} from '../common/Datafeed.ts';
import {
  AssetInfo,
  Dictionary,
  math,
  price,
  Price,
  uint,
} from '@splashprotocol/core';
import { Resolution } from '../../types/Resolution.ts';
import { SplashApiType } from '../apis/SplashApi.ts';
import { GetChartLastBarParams } from '../backends/splash/methods/getChartLastBar/getChartLastBarParams.ts';
import { Bar } from '../../types/Bar.ts';
import { GetChartHistoryParams } from '../backends/splash/methods/getChartHistory/getChartHistoryParams.ts';

export interface ExtendedLibrarySymbolInfo extends LibrarySymbolInfo {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly multiplier?: string;
  readonly getChartHistory?: (params: GetChartHistoryParams) => Promise<Bar[]>;
  readonly getChartLastBar?: (params: GetChartLastBarParams) => Promise<Bar>;
}

type TvResolution = '1' | '5' | '60' | '1D' | '1W' | '1M';

const mapTvResolutionToApiResolution: { [key in TvResolution]: Resolution } = {
  1: 'min1',
  5: 'min5',
  60: 'hour1',
  '1D': 'day1',
  '1W': 'week1',
  '1M': 'month1',
};

export interface DatafeedPair {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
  readonly multiplier?: string;
  readonly decimals?: number;
  readonly symbol: string;
  readonly getChartHistory?: (params: GetChartHistoryParams) => Promise<Bar[]>;
  readonly getChartLastBar?: (params: GetChartLastBarParams) => Promise<Bar>;
}

export interface SplashTVDataFeedParams {
  readonly pairs: DatafeedPair[];
  readonly api: SplashApiType;
  readonly lastBarTickInterval?: uint;
  readonly exchange?: string;
}

export class SplashTVDataFeed implements IDatafeedChartApi, IExternalDatafeed {
  private mapListenerGuidToIntervalId: Dictionary<NodeJS.Timeout> = {};

  private pairs: DatafeedPair[];

  private api: SplashApiType;

  private lastBarTickInterval: uint;

  private exchange: string;

  static new(params: SplashTVDataFeedParams): SplashTVDataFeed {
    return new SplashTVDataFeed(params);
  }

  private constructor({
    pairs,
    api,
    lastBarTickInterval,
    exchange = 'Splash',
  }: SplashTVDataFeedParams) {
    this.pairs = pairs;
    this.api = api;
    this.lastBarTickInterval = lastBarTickInterval || 5_000;
    this.exchange = exchange;
  }

  updatePairs(pairs: DatafeedPair[]) {
    this.pairs = pairs;
  }

  onReady(callback: OnReadyCallback) {
    callback({
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true,
      exchanges: [
        {
          name: this.exchange,
          desc: this.exchange,
          value: this.exchange,
        },
      ],
      symbols_types: [],
      // @ts-ignore
      supported_resolutions: ['1', '5', '60', '1D', '1W', '1M'],
    });
  }

  //@ts-ignore
  resolveSymbol(
    symbolName: string,
    onResolve: (esi: ExtendedLibrarySymbolInfo) => void,
    onError: ErrorCallback,
  ) {
    const pair = this.pairs.find((pair) => pair.symbol === symbolName);

    if (!pair) {
      onError('cannot resolve symbol' as any);
      return;
    }

    const pairTicker = `${pair.base.ticker}/${pair.quote.ticker}`;
    const priceScalePow: number = pair.decimals || pair.quote.decimals || 0;

    onResolve({
      ticker: pair.symbol,
      name: pair.symbol,
      description: pairTicker,
      session: '24x7',
      minmov: 1,
      volume_precision: pair.quote.decimals,
      pricescale: 10 ** priceScalePow,
      has_intraday: true,
      has_weekly_and_monthly: true,
      exchange: this.exchange,
      // @ts-ignore
      supported_resolutions: ['1', '5', '60', '1D', '1W', '1M'],
      data_status: 'streaming',
      base: pair.base,
      quote: pair.quote,
      multiplier: pair.multiplier,
      customDecimals: pair.decimals,
      getChartHistory: pair.getChartHistory,
      getChartLastBar: pair.getChartLastBar,
    });
  }

  searchSymbols() {
    throw new Error('not implemented');
  }

  async subscribeBars(
    symbolInfo: ExtendedLibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
  ) {
    const getLastBarParams: GetChartLastBarParams = {
      base: symbolInfo.base,
      quote: symbolInfo.quote,
      resolution: mapTvResolutionToApiResolution[resolution],
    };

    try {
      this.mapListenerGuidToIntervalId[listenerGuid] = setInterval(
        async () =>
          onTick(
            await this.getLastBar(
              getLastBarParams,
              symbolInfo.multiplier,
              symbolInfo.getChartLastBar,
            ),
          ),
        this.lastBarTickInterval,
      );
      onTick(
        await this.getLastBar(
          getLastBarParams,
          symbolInfo.multiplier,
          symbolInfo.getChartLastBar,
        ),
      );
    } catch (e) {
      console.error('[subscribeBars]: Fetch last bar error', e);
    }
  }

  // @ts-ignore
  async getBars(
    symbolInfo: ExtendedLibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback,
  ) {
    try {
      const bars = symbolInfo.getChartHistory
        ? await symbolInfo.getChartHistory({
            base: symbolInfo.base,
            quote: symbolInfo.quote,
            from: periodParams.from,
            to: periodParams.to,
            resolution: mapTvResolutionToApiResolution[resolution],
          })
        : await this.api.getChartHistory({
            base: symbolInfo.base,
            quote: symbolInfo.quote,
            from: periodParams.from,
            to: periodParams.to,
            resolution: mapTvResolutionToApiResolution[resolution],
          });
      if (bars.length) {
        onResult(
          bars.map((bar) =>
            this.normalizeBar(
              bar,
              symbolInfo.base,
              symbolInfo.quote,
              symbolInfo.multiplier,
            ),
          ),
          {
            noData: false,
          },
        );
      } else {
        onResult([], {
          noData: true,
        });
      }
    } catch (e) {
      onError((e as Error).message as any);
    }
  }

  unsubscribeBars(listenerGuid: string) {
    if (this.mapListenerGuidToIntervalId[listenerGuid]) {
      clearInterval(this.mapListenerGuidToIntervalId[listenerGuid]);
      delete this.mapListenerGuidToIntervalId[listenerGuid];
    }
  }

  private async getLastBar(
    params: GetChartLastBarParams,
    cross?: string,
    getChartLastBar?: ExtendedLibrarySymbolInfo['getChartLastBar'],
  ) {
    return (
      getChartLastBar
        ? getChartLastBar(params)
        : this.api.getChartLastBar(params)
    ).then((bar) => this.normalizeBar(bar, params.base, params.quote, cross));
  }

  private normalizeBar(
    bar: Bar,
    base: AssetInfo,
    quote: AssetInfo,
    multiplier?: string,
  ) {
    return {
      open: this.normalizePrice(bar.open, base, quote, multiplier),
      close: this.normalizePrice(bar.close, base, quote, multiplier),
      low: this.normalizePrice(bar.low, base, quote, multiplier),
      high: this.normalizePrice(bar.high, base, quote, multiplier),
      volume: Number(bar.volume),
      time: Number(bar.time),
    };
  }

  private normalizePrice(
    rawPrice: price,
    base: AssetInfo,
    quote: AssetInfo,
    multiplier?: string,
  ): number {
    const price = Price.new({
      value: rawPrice.toString(),
      base,
      quote,
    }).toNumber();

    return multiplier
      ? Number(math.evaluate(`${price} * ${multiplier}`).toFixed())
      : price;
  }
}

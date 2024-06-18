import { Resolution } from '../../core/api/types/common/Bar.ts';
import { GetChartLastBarParams } from '../../core/api/types/getChartLastBar/getChartLastBar.ts';
import { AssetInfo } from '../../core/models/assetInfo/AssetInfo.ts';
import { Pair } from '../../core/models/pair/Pair.ts';
import { Dictionary, uint } from '../../core/types/types.ts';
import { Splash } from '../splash.ts';
import {
  ErrorCallback,
  HistoryCallback,
  IDatafeedChartApi,
  IExternalDatafeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  PeriodParams,
  ResolutionString,
  SubscribeBarsCallback,
} from './Datafeed.ts';

export interface ExtendedLibrarySymbolInfo extends LibrarySymbolInfo {
  readonly base: AssetInfo;
  readonly quote: AssetInfo;
}

type TvResolution = '1' | '5' | '60' | 'D' | 'W' | 'M' | '12M';

const mapTvResolutionToApiResolution: { [key in TvResolution]: Resolution } = {
  1: 'min1',
  5: 'min5',
  60: 'hour1',
  D: 'day1',
  W: 'week1',
  M: 'month1',
  '12M': 'year1',
};

export interface SplashTVDataFeedParams {
  readonly pairs: Pair[];
  readonly splash: Splash<{}>;
  readonly lastBarTickInterval?: uint;
}

export class SplashTVDataFeed implements IDatafeedChartApi, IExternalDatafeed {
  private mapListenerGuidToIntervalId: Dictionary<NodeJS.Timeout> = {};

  private pairs: Pair[];

  private splash: Splash<{}>;

  private lastBarTickInterval: uint;

  static new(params: SplashTVDataFeedParams): SplashTVDataFeed {
    return new SplashTVDataFeed(params);
  }

  private constructor({
    pairs,
    splash,
    lastBarTickInterval,
  }: SplashTVDataFeedParams) {
    this.pairs = pairs;
    this.splash = splash;
    this.lastBarTickInterval = lastBarTickInterval || 5_000;
  }

  updatePairs(pairs: Pair[]) {
    this.pairs = pairs;
  }

  onReady(callback: OnReadyCallback) {
    callback({
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true,
      exchanges: [
        {
          name: 'Splash',
          desc: 'Splash',
          value: 'Splash',
        },
      ],
      symbols_types: [],
      // @ts-ignore
      supported_resolutions: ['1', '5', '60', 'D', 'W', 'M', 'Y'],
    });
  }

  resolveSymbol(
    symbolName: string,
    onResolve: (esi: ExtendedLibrarySymbolInfo) => void,
    onError: ErrorCallback,
  ) {
    const pair = this.pairs.find(
      ({ base, quote }) => `${base.ticker}/${quote.ticker}` === symbolName,
    );
    if (!pair) {
      onError('cannot resolve symbol');
      return;
    }

    const pairTicker = `${pair.base.ticker}/${pair.quote.ticker}`;

    onResolve({
      ticker: pairTicker,
      name: pairTicker,
      description: `${pairTicker} Pair`,
      session: '24x7',
      minmov: 1,
      volume_precision: pair.quote.decimals,
      pricescale: 10 ** pair.quote.decimals,
      has_intraday: true,
      has_weekly_and_monthly: true,
      exchange: 'Splash',
      // @ts-ignore
      supported_resolutions: ['1', '5', '60', 'D', 'W', 'M', 'Y'],
      data_status: 'streaming',
      base: pair.base,
      quote: pair.quote,
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
          onTick(await this.splash.api.getChartLastBar(getLastBarParams)),
        this.lastBarTickInterval,
      );
      onTick(await this.splash.api.getChartLastBar(getLastBarParams));
    } catch (e) {
      console.error('[subscribeBars]: Fetch last bar error', e);
    }
  }

  async getBars(
    symbolInfo: ExtendedLibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback,
  ) {
    try {
      const bars = await this.splash.api.getChartHistory({
        base: symbolInfo.base,
        quote: symbolInfo.quote,
        from: periodParams.from,
        to: periodParams.to,
        resolution: mapTvResolutionToApiResolution[resolution],
      });
      if (bars.length) {
        onResult(bars, {
          noData: false,
        });
      } else {
        onResult([], {
          noData: true,
        });
      }
    } catch (e) {
      onError((e as Error).message);
    }
  }

  unsubscribeBars(listenerGuid: string) {
    if (this.mapListenerGuidToIntervalId[listenerGuid]) {
      clearInterval(this.mapListenerGuidToIntervalId[listenerGuid]);
      delete this.mapListenerGuidToIntervalId[listenerGuid];
    }
  }
}

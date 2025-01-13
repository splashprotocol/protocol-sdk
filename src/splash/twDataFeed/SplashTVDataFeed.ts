import { RawBar, Resolution } from '../../core/api/types/common/RawBar.ts';
import { GetChartLastBarParams } from '../../core/api/types/getChartLastBar/getChartLastBar.ts';
import { AssetInfo } from '../../core/models/assetInfo/AssetInfo.ts';
import { Pair } from '../../core/models/pair/Pair.ts';
import { Price } from '../../core/models/price/Price.ts';
import { Dictionary, price, uint } from '../../core/types/types.ts';
import { math } from '../../core/utils/math/math.ts';
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
  readonly multiplier: number;
  readonly cross?: Price;
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

export interface SplashTVDataFeedParams {
  readonly pairs: Pair[];
  readonly splash: Splash<{}>;
  readonly lastBarTickInterval?: uint;
  readonly avoidCollision?: boolean;
  readonly exchange?: string;
  readonly resolutions?: TvResolution[];
}

export class SplashTVDataFeed implements IDatafeedChartApi, IExternalDatafeed {
  private mapListenerGuidToIntervalId: Dictionary<NodeJS.Timeout> = {};

  private pairs: Pair[];

  private splash: Splash<{}>;

  private lastBarTickInterval: uint;

  private avoidCollision: boolean;

  private exchange: string;

  private resolutions: TvResolution[];

  static new(params: SplashTVDataFeedParams): SplashTVDataFeed {
    return new SplashTVDataFeed(params);
  }

  private constructor({
    pairs,
    splash,
    lastBarTickInterval,
    exchange = 'Splash',
    avoidCollision = false,
    resolutions = ['1', '5', '60', '1D', '1W', '1M'],
  }: SplashTVDataFeedParams) {
    this.pairs = pairs;
    this.splash = splash;
    this.lastBarTickInterval = lastBarTickInterval || 5_000;
    this.avoidCollision = avoidCollision;
    this.exchange = exchange;
    this.resolutions = resolutions;
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
          name: this.exchange,
          desc: this.exchange,
          value: this.exchange,
        },
      ],
      symbols_types: [],
      // @ts-ignore
      supported_resolutions: this.resolutions,
    });
  }

  resolveSymbol(
    symbolName: string,
    onResolve: (esi: ExtendedLibrarySymbolInfo) => void,
    onError: ErrorCallback,
  ) {
    const pair = this.pairs.find((pair) =>
      this.avoidCollision
        ? `${pair.base.splashId}/${pair.quote.splashId}${
            pair['priceMultiplier'] ? `___${pair['priceMultiplier']}` : ''
          }${pair['cross'] ? `___cross` : ''}` === symbolName
        : `${pair.base.ticker}/${pair.quote.ticker}` === symbolName,
    );

    if (!pair) {
      onError('cannot resolve symbol');
      return;
    }

    const pairTicker = `${pair.base.ticker}/${
      pair['cross'] ? 'USD' : pair.quote.ticker
    }`;
    const pairName = this.avoidCollision
      ? `${pair.base.splashId}/${pair.quote.splashId}${
          pair['priceMultiplier'] ? `___${pair['priceMultiplier']}` : ''
        }${pair['cross'] ? `___cross` : ''}`
      : pairTicker;

    let priceScalePow: number = pair.quote.decimals;
    const fractions = pair.priceMinStep?.toString().split('.')[1];
    if (fractions !== undefined) {
      const firstPositiveFraction =
        fractions.split('').findIndex((fraction) => fraction !== '0') + 1;
      priceScalePow = Math.max(firstPositiveFraction, priceScalePow);
    }

    onResolve({
      ticker: pairName,
      name: pairName,
      description: `${pairTicker}`,
      session: '24x7',
      minmov: 1,
      volume_precision: pair.quote.decimals,
      pricescale: 10 ** Math.max(2, priceScalePow - pair['priceMultiplier']),
      has_intraday: true,
      has_weekly_and_monthly: true,
      exchange: this.exchange,
      data_status: 'streaming',
      base: pair.base,
      quote: pair.quote,
      multiplier: pair['priceMultiplier'],
      cross: pair['cross'],
    } as unknown as ExtendedLibrarySymbolInfo);
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
              symbolInfo.cross,
            ),
          ),
        this.lastBarTickInterval,
      );
      onTick(
        await this.getLastBar(
          getLastBarParams,
          symbolInfo.multiplier,
          symbolInfo.cross,
        ),
      );
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
        onResult(
          bars.map((bar) =>
            this.normalizeBar(
              bar,
              symbolInfo.base,
              symbolInfo.quote,
              symbolInfo.multiplier,
              symbolInfo.cross,
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
      onError((e as Error).message);
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
    multiplier: number,
    cross?: Price,
  ) {
    return this.splash.api
      .getChartLastBar(params)
      .then((bar) =>
        this.normalizeBar(bar, params.base, params.quote, multiplier, cross),
      );
  }

  private normalizeBar(
    bar: RawBar,
    base: AssetInfo,
    quote: AssetInfo,
    multiplier: number,
    cross?: Price,
  ) {
    return {
      open: this.normalizePrice(bar.open, base, quote, multiplier, cross),
      close: this.normalizePrice(bar.close, base, quote, multiplier, cross),
      low: this.normalizePrice(bar.low, base, quote, multiplier, cross),
      high: this.normalizePrice(bar.high, base, quote, multiplier, cross),
      volume: Number(bar.volume),
      time: Number(bar.time),
    };
  }

  private normalizePrice(
    rawPrice: price,
    base: AssetInfo,
    quote: AssetInfo,
    multiplier: number,
    cross?: Price,
  ): number {
    const withMultiplier =
      Price.new({
        raw: rawPrice,
        base,
        quote,
      }).toNumber() *
      10 ** multiplier;

    return cross
      ? Number(
          math.evaluate(`${withMultiplier} * ${cross.toString()}`).toFixed(),
        )
      : withMultiplier;
  }
}

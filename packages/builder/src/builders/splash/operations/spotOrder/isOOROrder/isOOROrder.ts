import {
  AssetInfo,
  OutputReference,
  OutputReferenceHash,
  Price,
} from '@splashprotocol/core';
import { BuilderLegacy } from '../../../../../core/BuilderLegacy.ts';
import { RawTradeOrder, SplashApiType } from '@splashprotocol/api';
import { Builder } from '../../../../../core/Builder.ts';
import { spotOrderDatum } from '../spotOrderDatum/spotOrderDatum.ts';

const getOrderByBeacon = (
  beacon: string,
  api: SplashApiType,
): Promise<RawTradeOrder> => {
  return fetch(
    `${api['backend']['url']}snekfun/history/order/trades?beacon=${beacon}`,
  ).then((res) => res.json());
};

export const isOOROrder = async (
  uTxORef: OutputReference | OutputReferenceHash,
  builder: BuilderLegacy<SplashApiType, any> | Builder<SplashApiType, any>,
): Promise<boolean> => {
  let normalizedUTxORef: OutputReference;

  if (uTxORef instanceof Object) {
    normalizedUTxORef = uTxORef;
  } else {
    const [txHash, index] = uTxORef.split(':');
    normalizedUTxORef = { txHash, index: BigInt(index) };
  }

  const output = await builder.explorer.getUTxOByRef(normalizedUTxORef);

  if (!output) {
    throw new Error(
      `order with ref: ${normalizedUTxORef.txHash}:${normalizedUTxORef.index} doesn't exist`,
    );
  }
  const datumCbor = output.wasmOutput.datum()?.as_datum()?.to_cbor_hex();

  if (!datumCbor) {
    throw new Error(
      `order with ref: ${normalizedUTxORef.txHash}:${normalizedUTxORef.index} isn't order output`,
    );
  }

  const isOrderDatum = await spotOrderDatum.validateCbor(datumCbor);
  if (!isOrderDatum) {
    throw new Error(
      `order with ref: ${normalizedUTxORef.txHash}:${normalizedUTxORef.index} isn't order output`,
    );
  }

  const datum = await spotOrderDatum.deserialize(datumCbor);
  const rawTradeOrder = await getOrderByBeacon(datum.beacon, builder.api);

  if (
    rawTradeOrder.orderStatus === 'closed' ||
    rawTradeOrder.orderStatus === 'partiallyClosed' ||
    rawTradeOrder.orderStatus === 'cancelled'
  ) {
    return false;
  }

  const base = AssetInfo.fromBase16(
    datum.inputAsset.policyId,
    datum.inputAsset.name,
  );
  const quote = AssetInfo.fromBase16(
    datum.outputAsset.policyId,
    datum.outputAsset.name,
  );
  const orderPrice = Price.new({
    base,
    quote: quote,
    value: datum.price,
  });
  const orderBook = await builder.api.getOrderBook({
    base,
    quote,
  });
  const isAsk = orderBook.base.isEquals(base);

  if (isAsk) {
    return (
      orderBook.bids.length === 0 || orderPrice.gt(orderBook.bids[0].price)
    );
  } else {
    return (
      orderBook.asks.length === 0 || orderBook.asks[0].price.gt(orderPrice)
    );
  }
};

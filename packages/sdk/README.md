# Splash typescript sdk

This repo contains an open-source code of the Splash Protocol SDK.

## Install

### npm
```npm
npm install @splashprotocol/sdk
```

### yarn

```yarn
yarn add @splashprotocol/sdk
```

## Init
You can initialize the sdk in both node.js (or similar server side environment) or in the browsed.
For the browser environment you will need your frontend framework to support WASM.

```typescript
const splashApi = SplashApi({ network: 'mainnet' });

const splashExplorer = SplashExplorer.new('mainnet');


const builder = SplashBuilder(splashApi, splashExplorer);
builder.selectWallet(() =>
    HotWallet.fromSeed('seed phrase', splashExplorer),
);
```

You can also use Maestro as a data provider.

_Currently, we do not support BlockFrost but this is something we aim to do in the near future._

## Fetching feeds
In our trading scripts you will need to request some market data that you can rely on.
Check the `SplashApi` for available methods.

## Placing orders
The order class interface looks ike the following:

```typescript
export interface SpotOrderConfig {
  readonly input: Currency; // Input asset for a trade
  readonly outputAsset: AssetInfo; // Output asset that you aim to receive after the trade is executed
  readonly price?: Price; // The price of the base asset in a quote asset
  readonly maxStepCount?: bigint; // This is needed to specify how many times your order can be partially filled on-chain. After reaching this number of fill the order will be ignored by the execution engine
  readonly slippage?: number;
}
```

### Limit order
To place a limit order you just need to sing and submit the order with a desirable price:

```typescript
// Order buys splash for 5 ada usign 0.18 price
const splashAssetId = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3.53504c415348';


const limitOrder = await builder
  .newTx({
      price: Price.new({
          value: '0.18',
          base: AssetInfo.fromAssetId(splashAssetId),
          quote: AssetInfo.ada
      }),
      input: Currency.ada(5000000n),
      outputAsset: AssetInfo.fromAssetId(splashAssetId)
  })
  .spotOrder()
  .complete()

// Submit order to chain
const txId = await limitOrder.signAndSubmit();
```

### Market order
Splash Protocol has only limit orders by design hence you always need to provide the execution price.
To simulate market orders use undefined price field.

```typescript
// Order buys splash for 5 ada usign actual price
import {AssetInfo} from "@splashprotocol/core";

const splashAssetId = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3.53504c415348';

const marketOrder = await builder
    .newTx({
        input: Currency.ada(5000000n),
        outputAsset: AssetInfo.fromAssetId(splashAssetId)
    })
    .spotOrder()
    .complete()

// Order sells 5 splash usign actual price
const marketOrder2 = await builder
    .newTx({
        input: Currency.new(
            5000000n, 
            AssetInfo.fromAssetId(splashAssetId)
        ),
        outputAsset: AssetInfo.ada
    })
    .spotOrder()
    .complete()

// Submit order to chain
const txId = await marketOrder.signAndSubmit();
```
You can create asset id usign subject:

```typescript
import {AssetInfo} from "@splashprotocol/core";

const splashSubject = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e353504c415348';
const splash = AssetInfo.fromSubject(splashSubject);
```

Also you can add custom slippage. By default order slippage is 15%
```typescript
const splashAssetId = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3.53504c415348';

// Order buys splash for 5 ada usign actual price with slippage 90%
const marketOrder = await builder
  .newTx()
  .spotOrder({
      slippage: 90,
      input: Currency.ada(5000000n),
      outputAsset: AssetInfo.fromAssetId(splashAssetId)
  })
  .complete()
```

Use can fetch pair order book usign `getOrderBook` api method
```typescript
const splashAssetId = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3.53504c415348';

const splashAdaOb = await builder.api.getOrderBook({
    base: AssetInfo.fromAssetId(splashAssetId),
    quote: AssetInfo.ada
});
```

For order price estimation you should use `selectEstimatedPrice` utility function
```typescript
const splashSubject = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e353504c415348';
const splashAdaOb = await builder.api.getOrderBook({
    base: AssetInfo.fromSubject(splashSubject),
    quote: AssetInfo.ada
});
// it returns estimated price for of splash for 10 ADA input
const estimatedPrice =  selectEstimatedPrice({
    orderBook: splashAdaOb,
    input: Currency.ada(10000000n),
    priceType: 'average'
});
```

### Multiple orders in one transaction
Cardano is a UTxO chan, so it allows you to create multiple outputs in one transaction.
Due to this Cardano feature we can create multiple DEX orders in one blockchain transaction.
Our sdk supports this by chaining.
```typescript
const splashSubject = 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e353504c415348';
const multipleOrders = await builder
  .newTx()
  .spotOrder({
    input: Currency.ada(5000000n),
    outputAsset: AssetInfo.fromSubject(splashSubject)
  })
  .spotOrder({
    input: Currency.ada(6000000n),
    outputAsset: AssetInfo.fromSubject(splashSubject)
  })
  .spotOrder({
    input: Currency.ada(7000000n),
    outputAsset: AssetInfo.fromSubject(splashSubject)
  })
  .complete();

const txId = await multipleOrders.signAndSubmit()
```

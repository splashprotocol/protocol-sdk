# Splash protocol spot order building

## Overview

This documentation provides a comprehensive guide to the Splash Protocol's spot order implementation. An order consists of two main parts: Datum and Output. This documentation starts with the Datum as it forms the foundation of the order structure.

## Table of Contents

1. [Order Datum Building](#order-datum-building)
   - [Datum Structure](#datum-structure)
   - [Field Descriptions](#field-descriptions)
     - [`type`](#type-datumbytes)
     - [`beacon`](#beacon-datumbytes)
     - [`inputAsset`](#inputasset-datumconstr0-policyid-name)
     - [`inputAmount`](#inputamount-datuminteger)
     - [`costPerExStep`](#costperexstep-datuminteger)
     - [`minMarginalOutput`](#minmarginaloutput-datuminteger)
       - [Special case: Infinite slippage](#special-case-for-infinite-slippage)
     - [`outputAsset`](#outputasset-datumconstr0-policyid-name)
     - [`price`](#price-datumconstr0-numerator-denominator)
       - [Price Calculation Algorithm](#price-calculation-algorithm)
       - [Example with ADA-SPLASH pair](#example-with-ada-splash-pair)
       - [Special case: Infinite slippage](#special-case-for-infinite-slippage-1)
     - [`executorFee`](#executorfee-datuminteger)
     - [`address`](#address-datumconstr0-paymentcredentials-stakecredentials)
     - [`cancelPkh`](#cancelpkh-datumbytes)
     - [`permittedExecutors`](#permittedexecutors-datumlistdatumbytes)
   - [Price Calculation from Order Book](#price-calculation-from-order-book)
     - [Order Book Algorithm](#order-book-algorithm)
       - [Step 1: Fetch Order Book Data](#step-1-fetch-order-book-data)
       - [Step 2: Select Order Side](#step-2-select-order-side)
       - [Step 3: Find Suitable Price Bin](#step-3-find-suitable-price-bin)
     - [Example Implementation](#example-implementation)
   - [Beacon Formation](#beacon-formation)
     - [Algorithm breakdown](#algorithm-breakdown)
     - [Implementation example](#implementation-example)
2. [Order Output Building](#order-output-building)
   - [Address Assembly](#address-assembly)
   - [Datum Assembly](#datum-assembly)
   - [Assets Assembly](#assets-assembly)
     - [1. Input Asset](#1-input-asset)
     - [2. Step Cost](#2-step-cost)
     - [3. Executor Fee](#3-executor-fee)
     - [4. Order Collateral](#4-order-collateral)
     - [5. Deposit for Order Receive](#5-deposit-for-order-receive)
     - [Final Assets Calculation](#final-assets-calculation)
     - [Complete Order Output](#complete-order-output)

## Order Datum Building

### Datum Structure

The exact specification of the spot order datum structure from `spotOrderDatum.ts`:

```typescript
export const spotOrderDatum = Datum.constr(0, {
  type: Datum.bytes(),
  beacon: Datum.bytes(),
  inputAsset: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  inputAmount: Datum.integer(),
  costPerExStep: Datum.integer(),
  minMarginalOutput: Datum.integer(),
  outputAsset: Datum.constr(0, {
    policyId: Datum.bytes(),
    name: Datum.bytes(),
  }),
  price: Datum.constr(0, {
    numerator: Datum.integer(),
    denominator: Datum.integer(),
  }),
  executorFee: Datum.integer(),
  address: Datum.constr(0, {
    paymentCredentials: Datum.anyOf([
      Datum.constr(0, {
        paymentKeyHash: Datum.bytes(),
      }),
      Datum.constr(1, {
        scriptHash: Datum.bytes(),
      }),
    ]),
    stakeCredentials: Datum.anyOf([
      Datum.constrAnyOf(0, [
        Datum.constrAnyOf(0, [
          Datum.constr(0, {
            paymentKeyHash: Datum.bytes(),
          }),
          Datum.constr(1, {
            scriptHash: Datum.bytes(),
          }),
        ]),
        Datum.constr(1, {
          slotNumber: Datum.integer(),
          transactionIndex: Datum.integer(),
          certificateIndex: Datum.integer(),
        }),
      ]),
      Datum.constr(1, {}),
    ]),
  }),
  cancelPkh: Datum.bytes(),
  permittedExecutors: Datum.list(Datum.bytes()),
});
```

### Field Descriptions

#### `type: Datum.bytes()`
Order type identifier. For Splash orders, this value is always `00`.

#### `beacon: Datum.bytes()` 
Track ID of the order for partial fulfillment. The beacon also serves as a validation tool - bots verify order validity using the beacon. See [Beacon Formation](#beacon-formation) for details on how the beacon is generated.

#### `inputAsset: Datum.constr(0, {policyId, name})`
The asset being sold in the order:
- `policyId: Datum.bytes()` - Policy ID of the input asset (empty string for ADA)
- `name: Datum.bytes()` - Asset name in hex format (empty string for ADA)

Example:
```typescript
{
  policyId: 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3',
  // splash
  name: '53504c415348'
}
```

#### `inputAmount: Datum.integer()`
The amount of input asset being sold, represented as the smallest unit of the asset.

#### `costPerExStep: Datum.integer()` 
The cost in lovelace for each execution step. Current value is `1000000` lovelace. 

The actual value can be obtained from [spectrum.fi/settings.json](https://spectrum.fi/settings.json) under `spotOrderV3.settings.orderStepCost`.

#### `minMarginalOutput: Datum.integer()`
The minimum amount of output asset that must be received per execution step. 

**Calculation algorithm:**
```typescript
minMarginalOutput = price * inputAmount
```

Where:
- `price` is the exchange rate (see [price field](#price-datumconstr0-numerator-denominator) below)
- `inputAmount` is the amount of input asset being sold

**Special case for infinite slippage:**
```typescript
minMarginalOutput = 1
```

This represents the total expected output divided by max step count.

#### `outputAsset: Datum.constr(0, {policyId, name})`
The asset being purchased in the order:
- `policyId: Datum.bytes()` - Policy ID of the output asset (empty string for ADA)
- `name: Datum.bytes()` - Asset name in hex format (empty string for ADA)

Example:
```typescript
{
  policyId: 'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e3',
  // splash
  name: '53504c415348'
}
```

#### `price: Datum.constr(0, {numerator, denominator})`
The exchange rate as a rational number:
- `numerator: Datum.integer()` - Price numerator
- `denominator: Datum.integer()` - Price denominator

**Price Calculation Algorithm:**

1. **Get current price from order book** for the specified volume
2. **Check if inputAsset is the base asset** of the price:
   - If yes: use price as is
   - If no: use `1 / basePrice` (invert the price)
3. **Apply slippage:**
   - For **buy orders**: `price = price / 100 * (100 + slippage)`
   - For **sell orders**: `price = price / 100 * (100 - slippage)`

**Example with ADA-SPLASH pair:**

1. **When buying SPLASH:**
   - `outputAsset` = SPLASH (quote asset)
   - `inputAsset` = ADA (base asset)
   - Price represents: how much SPLASH per 1 ADA

2. **When selling SPLASH:**
   - `inputAsset` = SPLASH (base asset) 
   - `outputAsset` = ADA (quote asset)
   - Price represents: how much ADA per 1 SPLASH

**Special case for infinite slippage:**
```typescript
{
  numerator: 0,
  denominator: 1
}
```

The price represents how many units of quote asset (output) per unit of base asset (input).

**For detailed order book integration algorithm, see [Price Calculation from Order Book](#price-calculation-from-order-book) subsection below.**

#### `executorFee: Datum.integer()`
Fee in lovelace paid to the executor (batcher) for processing the order. Current value is `1000000` lovelace.

The actual value can be obtained from [spectrum.fi/settings.json](https://spectrum.fi/settings.json) under `spotOrderV3.settings.executorFee`.

#### `address: Datum.constr(0, {paymentCredentials, stakeCredentials})`
The user's address where outputs will be sent:
- `paymentCredentials` - Either:
  - `Datum.constr(0, {paymentKeyHash})` - Public key hash
  - `Datum.constr(1, {scriptHash})` - Script hash
- `stakeCredentials` - Optional staking credentials, can be:
  - Payment key hash or script hash
  - Pointer address (slot, transaction index, certificate index)
  - Empty (no staking credentials)

#### `cancelPkh: Datum.bytes()`
Public key hash that has permission to cancel the order. Typically set to the user's payment key hash.

#### `permittedExecutors: Datum.list(Datum.bytes())`
List of public key hashes that are allowed to execute this order. Usually contains the batcher's key hash.

**Default values by network:**
- **Mainnet**: `['5cb2c968e5d1c7197a6ce7615967310a375545d9bc65063a964335b2']`
- **Preprod**: `['6d0c0c4f9845be1102cd3760dd87d86675d0f842189bb46f00a8c952']`

### Price Calculation from Order Book

**Disclaimer:** You can use your own algorithm to calculate user output based on input using pool reserves.

#### Order Book Algorithm

**Step 1: Fetch Order Book Data**

```typescript
// Network-specific URLs
const urls = {
  mainnet: 'https://analytics.splash.trade/mempool/v2/mempool/orders',
  preprod: 'https://api-test-preprod.splash.trade/mempool/v2/mempool/orders'
};

// Fetch order book
const orderBookUrl = `${urls[network]}/trading-view/order-book?base=${base.assetId}&quote=${quote.assetId}`;
const orderBook = await fetch(orderBookUrl).then(res => res.json());
```

**Step 2: Select Order Side**

Choose the appropriate order side based on operation type:

```typescript
const orderSide = isBuyOrder ? 'ask' : 'bid';
const bins = orderBook[orderSide]; // 'ask' for buying, 'bid' for selling
```

- **Ask**: Use for **buying** operations (taking from sell orders)
- **Bid**: Use for **selling** operations (taking from buy orders)

**Step 3: Find Suitable Price Bin**

Find the bin with sufficient liquidity for the user input:

```typescript
function findPriceBin(bins, requiredVolume, needsPriceInversion = false) {
  for (const bin of bins) {
    let availableVolume = bin.accumulatedLiquidity;
    
    // If price needs inversion, calculate volume in terms of the other asset
    if (needsPriceInversion) {
      availableVolume = bin.accumulatedLiquidity * (1 / bin.price);
    }
    
    // Check if this bin has enough liquidity
    if (availableVolume >= requiredVolume) {
      return needsPriceInversion ? (1 / bin.price) : bin.price;
    }
  }
  
  throw new Error('Insufficient liquidity in order book');
}
```

**Example Implementation:**

```typescript
async function getOrderBookPrice(
  network: 'mainnet' | 'preprod',
  inputAsset: Asset,
  outputAsset: Asset,
  inputAmount: bigint,
  isBuyOrder: boolean
) {
  // 1. Fetch order book
  const base = inputAsset;
  const quote = outputAsset;
  const url = network === 'mainnet' 
    ? 'https://analytics.splash.trade/mempool/v2/mempool/orders'
    : 'https://api-test-preprod.splash.trade/mempool/v2/mempool/orders';
    
  const orderBook = await fetch(
    `${url}/trading-view/order-book?base=${base.assetId}&quote=${quote.assetId}`
  ).then(res => res.json());
  
  // 2. Select appropriate side and find price
  const side = isBuyOrder ? 'ask' : 'bid';
  const bins = orderBook[side];
  
  const needsInversion = inputAsset.assetId !== base.assetId;
  const price = findPriceBin(bins, inputAmount, needsInversion);
    
  return price;
}
```

### Beacon Formation

The beacon is a unique identifier generated for each order using the following algorithm:

```typescript
beacon = blake2b224(
  inputUtxoHash || 
  bigEndianInputUtxoIndex || 
  bigEndianOrderOutputIndex || 
  blake2b224(datumWithEmptyBeacon)
)
```

**Algorithm breakdown:**

1. **Input UTxO data**: Take any input UTxO from the transaction being formed
   - `inputUtxoHash` - Hash of the input UTxO (32 bytes)
   - `bigEndianInputUtxoIndex` - Index of the input UTxO in big-endian format (8 bytes)

2. **Order output data**:
   - `bigEndianOrderOutputIndex` - Index of the order output in big-endian format (8 bytes)

3. **Datum with empty beacon**:
   - Create a datum identical to the original but with empty beacon
   - Empty beacon = `bytesToHex(Uint8Array.from(new Array(28).fill(0)))`
   - Calculate `blake2b224` hash of this datum (28 bytes)

4. **Final beacon calculation**:
   - Concatenate all components in order
   - Calculate `blake2b224` hash of the concatenated data

**Implementation example:**

```typescript
// Step 1: Create datum with empty beacon (28 zero bytes)
const emptyBeacon = bytesToHex(Uint8Array.from(new Array(28).fill(0)));
const datumWithEmptyBeacon = { ...originalDatum, beacon: emptyBeacon };

// Step 2: Calculate component hashes
const datumHash = blake2b224(serializeDatum(datumWithEmptyBeacon));

// Step 3: Concatenate and hash
const beacon = blake2b224(
  inputUtxoHash +
  toBigEndian(inputUtxoIndex, 8) +
  toBigEndian(orderOutputIndex, 8) +
  datumHash
);
```

This ensures each order has a unique, deterministic identifier that can be recalculated for validation.

## Order Output Building

Order output building involves assembling the complete UTxO output that will be sent to the smart contract. The output consists of three main components: address, datum, and assets.

### Address Assembly

The order output address is constructed using:

```typescript
// Script hash for the order contract
const scriptHash = '464eeee89f05aff787d40045af2a40a83fd96c513197d32fbc54ff02';

// Extract stake key hash from user address
const userStakeKeyHash = extractStakeKeyHash(userAddress);

// Assemble contract address
const contractAddress = assembleAddress({
  paymentCredentials: {
    type: 'script',
    hash: scriptHash
  },
  stakeCredentials: {
    type: 'key', 
    hash: userStakeKeyHash
  }
});
```

**Components:**
- **Script hash**: `464eeee89f05aff787d40045af2a40a83fd96c513197d32fbc54ff02` (fixed contract script)
- **Stake key hash**: Extracted from the user's address

### Datum Assembly

The datum is constructed using the process described in the [Order Datum Building](#order-datum-building) section:

```typescript
const orderDatum = buildOrderDatum({
  type,
  beacon,
  inputAsset,
  inputAmount,
  costPerExStep,
  minMarginalOutput,
  outputAsset,
  price,
  executorFee,
  address: userAddress,
  cancelPkh,
  permittedExecutors
});
```

Refer to [Field Descriptions](#field-descriptions) for detailed information about each datum field.

### Assets Assembly

The order output must include the following assets:

#### 1. Input Asset
The asset being sold, as declared in the datum:
```typescript
const inputAssets = {
  [inputAsset.policyId + inputAsset.name]: inputAmount
};
```

#### 2. Step Cost
Execution cost for order processing (from datum):
```typescript
const stepCostAda = costPerExStep; // lovelace
```

#### 3. Executor Fee
Fee paid to the executor (from datum):
```typescript
const executorFeeAda = executorFee; // lovelace
```

#### 4. Order Collateral
Fixed collateral requirement:
```typescript
const orderCollateral = 1_500_000; // lovelace (1.5 ADA)
```

#### 5. Deposit for Order Receive
Minimum UTxO value for the predicted response output:

```typescript
// Calculate predicted output
const predictedOutput = calculatePredictedOutput(inputAmount, price);

// Calculate min UTxO for response
const depositOrderForReceive = calculateMinUtxoValue({
  address: userAddress,
  value: {
    [outputAsset.policyId + outputAsset.name]: predictedOutput
  },
  datum: null
});
```

**Example calculation:**
For buying 100 SPLASH for ADA, calculate the minimum UTxO value for:
```typescript
{
  address: userAddress,
  value: { 
    'ececc92aeaaac1f5b665f567b01baec8bc2771804b4c21716a87a4e353504c415348': 100000000 // 100 SPLASH
  },
  datum: null
}
```

#### Final Assets Calculation

```typescript
const totalAssets = {
  // ADA components
  lovelace: stepCostAda + executorFeeAda + orderCollateral + depositOrderForReceive,
  
  // Input asset (if not ADA)
  ...(inputAsset.policyId !== '' && {
    [inputAsset.policyId + inputAsset.name]: inputAmount
  })
};
```

**Complete Order Output:**

```typescript
const orderOutput = {
  address: contractAddress,
  datum: orderDatum,
  value: totalAssets
};
``` 
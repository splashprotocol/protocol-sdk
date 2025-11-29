# Splash Protocol SDK

> ⚠️ **LEGACY SDK ALERT**  
> This is a legacy SDK currently used by the existing Splash UI. This version is maintained for compatibility with the current production interface but may not include the latest protocol features and optimizations.

## Overview

The Splash Protocol SDK is a TypeScript library for interacting with the Splash Protocol on Cardano. It provides comprehensive tools for DeFi operations including liquidity provision, trading, and pool management.

## Features

- **Pool Operations**: Create and manage CFMM, Weighted, and Stable pools
- **Trading**: Spot orders and trade execution
- **Liquidity Management**: Deposit and redeem operations
- **Data Access**: Real-time protocol statistics, charts, and market data
- **Wallet Integration**: CIP-30 compatible wallet support
- **Transaction Building**: Complete transaction construction and signing utilities

## Installation

```bash
yarn add @splashprotocol/sdk@1.0.70
```

## Quick Start

```typescript
import { SplashApi, TxBuilderFactory } from '@splashprotocol/sdk';

// Initialize API
const api = new SplashApi();

// Get protocol statistics
const stats = await api.getProtocolStats();

// Initialize transaction builder
const txBuilder = new TxBuilderFactory(networkContext, protocolParams);
```

## Core Components

### API Layer
- **SplashApi**: Main API interface for protocol data
- **Asset Metadata**: Token information and metadata
- **Chart Data**: Historical price and volume data
- **Order Book**: Real-time trading data

### Models
- **Pools**: CFMM, Weighted, and Stable pool implementations
- **Orders**: Trade and liquidity order management
- **Currencies**: Multi-asset currency handling
- **Transactions**: Transaction building and validation

### Utilities
- **Data Conversion**: CBOR, hex, and string utilities
- **Math Operations**: Precision arithmetic for DeFi calculations
- **Address Handling**: Cardano address utilities
- **Fee Calculation**: Transaction and executor fee estimation

## Pool Types

### CFMM Pools
Constant Function Market Maker pools for standard trading pairs.

### Weighted Pools
Multi-asset pools with configurable weight ratios.

### Stable Pools
Optimized pools for stable asset pairs with minimal slippage.

## Transaction Operations

- **Spot Orders**: Market and limit order execution
- **Liquidity Operations**: Add/remove liquidity from pools
- **Pool Creation**: Deploy new trading pools
- **Cancel Operations**: Cancel pending orders

## Development

### Build
```bash
yarn build
```

### Test
```bash
yarn test
```

### Watch Mode
```bash
yarn dev:code
yarn dev:test
```

### Documentation
```bash
yarn doc
```

## Network Support

- **Mainnet**: Production Cardano network
- **Testnet**: Development and testing environment

## Dependencies

- Cardano Multiplatform Library
- CBOR encoding/decoding
- Hash utilities
- Mathematical operations

## License

ISC

## Version

Current version: 1.0.70

---

For the latest SDK version and new features, please check for updated releases and migration guides.

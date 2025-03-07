# TriggerX Superchain Demo using Devnets

## Cloned and modified from [Superchain Starter Kit](https://github.com/ethereum-optimism/superchain-starter)

A lightweight, focused starting point for prototyping/building on the Superchain, featuring

- 🛠 [InterOp Devnets](https://console.optimism.io/getting-started)
- 🎨 wagmi, viem
- [@eth-optimism/viem](https://github.com/ethereum-optimism/ecosystem/tree/main/packages/viem), [@eth-optimism/wagmi](https://github.com/ethereum-optimism/ecosystem/tree/main/packages/wagmi) - viem/wagmi extensions for the Superchain
- 💡 simple example app - CrossChainCounter

## 🚀 Getting started

### Prerequisites: Node

### 1. Clone the repository

```bash
git clone https://github.com/trigg3rX/triggerx-superchain.git
cd triggerx-superchain
```

### 3. Install dependencies

```bash
pnpm i
```

### 4. Get started

```bash
pnpm dev:frontend
```

This command will:

- Launch the frontend development server at (http://localhost:5173)
- Connect your wallet to the app.
- Use 2 different methods to increment the counter:
  - Direct method: Call the `increment` function on the `CrossChainCounterIncrementer` contract.
  - Indirect method: Send a message to the `L2ToL2CrossDomainMessenger` contract.
- See the counter value on the destination chain in real time.

Start building on the Superchain!

## 👀 Overview

### Example app

#### `CrossChainCounter` contract

- Simple `Hello world` for Superchain Interop
- Unlike the [single chain Counter](https://github.com/foundry-rs/foundry/blob/master/crates/forge/assets/CounterTemplate.sol), this one can only be incremented via cross-chain messages
- Learn more about this contract [here](./contracts/README.md)

### 📁 Directory structure

This starter kit is organized to get you building on the Superchain as quickly as possible. Solidity code goes in `/contracts`, and the typescript frontend goes in `/src`

```
superchain-starter/
├── contracts/                   # Smart contract code (Foundry)
├── src/                        # Frontend code (vite, tailwind, shadcn, wagmi, viem)
│   └── App.tsx                # Main application component
├── public/                     # Static assets for the frontend
├── package.json               # Project dependencies and scripts
└── mprocs.yaml               # Run multiple commands using mprocs
```

### A note on project structure

While this structure is great for getting started and building proof of concepts, it's worth noting that many production applications eventually migrate to separate repositories for contracts and frontend code.

For reference, here are some examples of this separation in production applications:

- Uniswap: [Uniswap contracts](https://github.com/Uniswap/v4-core), [Uniswap frontend](https://github.com/Uniswap/interface)
- Across: [Across contracts](https://github.com/across-protocol/contracts), [Across frontend](https://github.com/across-protocol/frontend)
- Farcaster: [Farcaster contracts](https://github.com/farcasterxyz/contracts)
- TriggerX: [TriggerX contracts](https://github.com/trigg3rX/triggerx-contracts), [TriggerX frontend](https://github.com/trigg3rX/triggerx-frontend-home)

## 🐛 Debugging

Use the error selectors below to identify the cause of reverts.

- For a complete list of error signatures from interoperability contracts, see [abi-signatures.md](https://github.com/ethereum-optimism/ecosystem/blob/main/packages/viem/docs/abi-signatures.md)
- Examples:
  - `TargetCallFailed()`: `0xeda86850`
  - `MessageAlreadyRelayed`: `0x9ca9480b`
  - `Unauthorized()`: `0x82b42900`
 
## 📚 More resources

- Interop recipes / guides: https://docs.optimism.io/app-developers/tutorials/interop
- Superchain Dev Console: https://console.optimism.io/

## ⚖️ License

Files are licensed under the [MIT license](./LICENSE).

<a href="./LICENSE"><img src="https://user-images.githubusercontent.com/35039927/231030761-66f5ce58-a4e9-4695-b1fe-255b1bceac92.png" alt="License information" width="200" /></a>

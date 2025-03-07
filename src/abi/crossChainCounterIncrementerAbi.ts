export const crossChainCounterIncrementerAbi = [
  {
    type: 'function',
    name: 'increment',
    inputs: [
      { name: 'counterChainId', type: 'uint256', internalType: 'uint256' },
      { name: 'counterAddress', type: 'address', internalType: 'address' },
    ],
    outputs: [{ name: 'msgHash', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
] as const;

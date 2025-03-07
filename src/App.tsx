import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
  useAccount,
  useChainId,
  useSwitchChain,
} from 'wagmi';
import { interopAlpha0, interopAlpha1 } from '@eth-optimism/viem/chains';
import { contracts, l2ToL2CrossDomainMessengerAbi } from '@eth-optimism/viem';
import { sortBy } from '@/lib/utils';
import { encodeFunctionData } from 'viem';
import { crossChainCounterAbi } from '@/abi/crossChainCounterAbi';
import { crossChainCounterIncrementerAbi } from '@/abi/crossChainCounterIncrementerAbi';
import { Header } from '@/components/Header';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  // Using Metamask wallet instead of hardcoded private key
  sourceChain: interopAlpha0,
  destinationChain: interopAlpha1,
  contracts: {
    counter: {
      address: '0x1b68f70248d6d2176c88d9285564cd23173d41d3',
    },
    counterIncrementer: {
      address: '0x8e238A310C851e851B59974E2bcD7e833fD3CE60',
    },
  },
} as const;

// ============================================================================
// Source Chain Components (Chain A)
// ============================================================================

const CounterIncrementer = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data, writeContract, isPending } = useWriteContract();
  const { isLoading: isWaitingForReceipt, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId: CONFIG.sourceChain.id,
    pollingInterval: 1000,
  });

  const isWrongChain = chainId !== CONFIG.sourceChain.id;
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // Reset status when transaction completes
  useEffect(() => {
    if (isSuccess) {
      setTxStatus('success');
      const timer = setTimeout(() => setTxStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const buttonText = isWaitingForReceipt
    ? 'Waiting for confirmation...'
    : isPending
      ? 'Sending...'
      : isWrongChain
        ? `Switch to ${CONFIG.sourceChain.name}`
        : txStatus === 'success'
          ? 'Increment Sent!'
          : 'Increment';

  const handleClick = () => {
    if (isWrongChain) {
      switchChain({ chainId: CONFIG.sourceChain.id });
    } else {
      setTxStatus('pending');
      try {
        writeContract({
          chainId: CONFIG.sourceChain.id,
          address: CONFIG.contracts.counterIncrementer.address,
          abi: crossChainCounterIncrementerAbi,
          functionName: 'increment',
          args: [BigInt(CONFIG.destinationChain.id), CONFIG.contracts.counter.address],
        });
      } catch (error) {
        setTxStatus('error');
        setTimeout(() => setTxStatus('idle'), 3000);
      }
    }
  };

  return (
    <>
      <div className="text-sm text-muted-foreground">
        Method 1: Increment the counter by calling the <span className="font-mono">increment</span>{' '}
        function on the <span className="font-mono">CrossChainCounterIncrementer</span> contract.
      </div>
      <Card>
        <CardHeader className="font-mono">
          <CardTitle className="font-mono">CrossChainCounterIncrementer</CardTitle>
          <CardDescription className="font-mono">
            {CONFIG.contracts.counterIncrementer.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="p-4 bg-muted rounded-md">
            <div className="font-mono text-xs space-y-2">
              <div className="font-bold">
                increment(uint256 counterChainId, address counterAddress)
              </div>
              <div className="pl-4">
                <div>counterChainId: {CONFIG.destinationChain.id}</div>
                <div>counterAddress: {CONFIG.contracts.counter.address}</div>
              </div>
            </div>
          </div>
          {txStatus === 'success' && (
            <div className="text-sm p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 rounded">
              Transaction sent successfully! The counter will be incremented once the message is received on the destination chain.
            </div>
          )}
          {txStatus === 'error' && (
            <div className="text-sm p-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100 rounded">
              Transaction failed. Please try again.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex">
          <Button
            className="flex-1"
            onClick={handleClick}
            disabled={!address || isPending || isWaitingForReceipt || txStatus === 'success'}
            variant={txStatus === 'success' ? 'outline' : 'default'}
          >
            {(isPending || isWaitingForReceipt) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

const DirectMessengerCall = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract, isPending, data } = useWriteContract();
  const { isLoading: isWaitingForReceipt, isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId: CONFIG.sourceChain.id,
    pollingInterval: 1000,
  });

  const isWrongChain = chainId !== CONFIG.sourceChain.id;
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  // Reset status when transaction completes
  useEffect(() => {
    if (isSuccess) {
      setTxStatus('success');
      const timer = setTimeout(() => setTxStatus('idle'), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const buttonText = isWaitingForReceipt
    ? 'Waiting for confirmation...'
    : isPending
      ? 'Sending...'
      : isWrongChain
        ? `Switch to ${CONFIG.sourceChain.name}`
        : txStatus === 'success'
          ? 'Message Sent!'
          : 'Send Message';

  const incrementFunctionData = encodeFunctionData({
    abi: crossChainCounterAbi,
    functionName: 'increment',
  });

  const handleClick = () => {
    if (isWrongChain) {
      switchChain({ chainId: CONFIG.sourceChain.id });
    } else {
      setTxStatus('pending');
      try {
        writeContract({
          chainId: CONFIG.sourceChain.id,
          address: contracts.l2ToL2CrossDomainMessenger.address,
          abi: l2ToL2CrossDomainMessengerAbi,
          functionName: 'sendMessage',
          args: [
            BigInt(CONFIG.destinationChain.id),
            CONFIG.contracts.counter.address,
            incrementFunctionData,
          ],
        });
      } catch (error) {
        setTxStatus('error');
        setTimeout(() => setTxStatus('idle'), 3000);
      }
    }
  };

  return (
    <>
      <div className="text-sm text-muted-foreground">
        Method 2: Increment the counter by sending message by directly calling the{' '}
        <span className="font-mono">sendMessage</span> function on the{' '}
        <span className="font-mono">L2ToL2CrossDomainMessenger</span> contract.
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">L2ToL2CrossDomainMessenger</CardTitle>
          <CardDescription className="font-mono">
            {contracts.l2ToL2CrossDomainMessenger.address}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="p-4 bg-muted rounded-md">
            <div className="font-mono text-xs space-y-2">
              <div className="font-bold">
                sendMessage(uint256 _destination, address _target, bytes calldata _message)
              </div>
              <div className="pl-4">
                <div>_destination: {CONFIG.destinationChain.id}</div>
                <div>_address: {CONFIG.contracts.counter.address}</div>
                <div>
                  _message: {incrementFunctionData} <span className="font-bold">increment()</span>
                </div>
              </div>
            </div>
          </div>
          {txStatus === 'success' && (
            <div className="text-sm p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 rounded">
              Message sent successfully! The counter will be incremented once the message is received on the destination chain.
            </div>
          )}
          {txStatus === 'error' && (
            <div className="text-sm p-2 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100 rounded">
              Transaction failed. Please try again.
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="flex-1"
            onClick={handleClick}
            disabled={!address || isPending || isWaitingForReceipt || txStatus === 'success'}
            variant={txStatus === 'success' ? 'outline' : 'default'}
          >
            {(isPending || isWaitingForReceipt) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

const SourceChain = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isCorrectChain = chainId === CONFIG.sourceChain.id;

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold">
          Chain: {CONFIG.sourceChain.name} ({CONFIG.sourceChain.id})
        </div>
        <div className="flex items-center gap-2">
          {isCorrectChain ? (
            <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
              Connected
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => switchChain({ chainId: CONFIG.sourceChain.id })}
              className="text-xs"
            >
              Switch Chain
            </Button>
          )}
        </div>
      </div>
      <CounterIncrementer />
      <Separator />
      <DirectMessengerCall />
    </div>
  );
};

// ============================================================================
// Destination Chain Components (Chain B)
// ============================================================================

const DestinationChain = () => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isCorrectChain = chainId === CONFIG.destinationChain.id;

  const [logs, setLogs] = useState<
    Array<{
      senderChainId: bigint;
      sender: string;
      newValue: bigint;
      transactionHash: string;
      blockNumber: bigint;
    }>
  >([]);

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        address: CONFIG.contracts.counter.address,
        abi: crossChainCounterAbi,
        functionName: 'number',
        chainId: CONFIG.destinationChain.id,
      },
      {
        address: CONFIG.contracts.counter.address,
        abi: crossChainCounterAbi,
        functionName: 'lastIncrementer',
        chainId: CONFIG.destinationChain.id,
      },
    ],
  });

  useWatchContractEvent({
    address: CONFIG.contracts.counter.address,
    abi: crossChainCounterAbi,
    eventName: 'CounterIncremented',
    chainId: CONFIG.destinationChain.id,
    onLogs: newLogs => {
      setLogs(prevLogs => [
        ...prevLogs,
        ...newLogs.map(log => ({
          senderChainId: log.args.senderChainId!,
          sender: log.args.sender!,
          newValue: log.args.newValue!,
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
        })),
      ]);
      refetch();
    },
  });

  const sortedLogs = useMemo(() => sortBy(logs, log => -log.blockNumber), [logs]);

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold">
          Chain: {CONFIG.destinationChain.name} ({CONFIG.destinationChain.id})
        </div>
        <div className="flex items-center gap-2">
          {isCorrectChain ? (
            <div className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
              Connected
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => switchChain({ chainId: CONFIG.destinationChain.id })}
              className="text-xs"
            >
              Switch Chain
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Watch for state changes as the counter is incremented from the source chain.
      </div>
      <Card>
        <CardHeader className="font-mono">
          <CardTitle className="font-mono">CrossChainCounter</CardTitle>
          <CardDescription>{CONFIG.contracts.counter.address}</CardDescription>
        </CardHeader>

        {/* Counter Current State */}
        <CardContent className="space-y-4 font-mono pb-4">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground shrink-0">number:</span>
            <span className="font-mono text-right">{data?.[0]?.result?.toString() ?? '—'}</span>
          </div>
          <div className="space-y-2">
            <div className="text-muted-foreground">lastIncrementer:</div>
            <div className="pl-4 flex flex-col gap-2">
              <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground shrink-0">chainId:</span>
                <span className="font-mono text-right">
                  {data?.[1]?.result?.[0]?.toString() ?? '—'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground shrink-0">sender:</span>
                <span className="font-mono text-right truncate">
                  {data?.[1]?.result?.[1] ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        <Separator />

        {/* Event Logs */}
        <CardFooter className="pt-6">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <div>
                Listening for <span className="font-mono">CounterIncremented</span> events...
              </div>
            </div>
            <div className="space-y-1">
              {sortedLogs.length > 0 && (
                <div className="text-sm text-muted-foreground font-mono grid grid-cols-4 gap-4 px-2">
                  <div>blockNumber</div>
                  <div>senderChainId</div>
                  <div>sender</div>
                  <div>newValue</div>
                </div>
              )}
              {sortedLogs.map(log => (
                <div
                  key={log.transactionHash}
                  className="p-2 rounded-md hover:bg-muted transition-colors grid grid-cols-4 gap-4 text-sm font-mono"
                >
                  <div>{log.blockNumber.toString()}</div>
                  <div>{log.senderChainId.toString()}</div>
                  <div className="truncate">{log.sender}</div>
                  <div>{log.newValue.toString()}</div>
                </div>
              ))}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// ============================================================================
// Main App
// ============================================================================

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-4">
          <SourceChain />
          <DestinationChain />
        </div>
      </main>
    </div>
  );
}

export default App;

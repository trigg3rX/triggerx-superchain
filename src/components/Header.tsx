import { Button } from '@/components/ui/button';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';

export const Header = () => {
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showFullAddress, setShowFullAddress] = useState(false);

  const displayAddress = address 
    ? showFullAddress 
      ? address 
      : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';

  return (
    <div className="flex justify-between items-center py-4 px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <h1 className="text-2xl font-bold">TriggerX Superchain Demo</h1>
      
      <div className="flex items-center gap-4">
        {isConnected && address && (
          <div 
            className="text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 px-3 py-1 rounded-full flex items-center gap-2 transition-colors"
            onClick={() => setShowFullAddress(!showFullAddress)}
            title={showFullAddress ? "Click to show shortened address" : "Click to show full address"}
            style={{ cursor: 'pointer' }}
          >
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            {displayAddress}
          </div>
        )}
        
        {!isConnected ? (
          <Button 
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending}
            size="sm"
          >
            {isPending ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <Button 
            onClick={() => disconnect()}
            variant="outline"
            size="sm"
          >
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
};

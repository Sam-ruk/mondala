import { Connector, useAccount, useConnect, useSwitchChain, useWriteContract } from 'wagmi';
import { PublicClient, getAddress } from 'viem'; // Add getAddress for address validation
import { monadTestnet } from '../wagmiConfig';

interface UseMintProps {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  chainId: number | undefined;
  connect: ReturnType<typeof useConnect>['connect'];
  connectors: readonly Connector[];
  switchChainAsync: ReturnType<typeof useSwitchChain>['switchChainAsync'];
  writeContractAsync: ReturnType<typeof useWriteContract>['writeContractAsync'];
  isPending: boolean;
  setAlert: (alert: { message: string; type: 'success' | 'error' } | null) => void;
  CONTRACT_ADDRESS: `0x${string}`; // Changed from string to `0x${string}`
  CHAIN_ID: number;
  SVGNFTABI: any; // Consider typing this properly with Abi type
  publicClient: PublicClient;
}

export default function useMint({
  address,
  isConnected,
  chainId,
  connect,
  connectors,
  switchChainAsync,
  writeContractAsync,
  isPending,
  setAlert,
  CONTRACT_ADDRESS,
  CHAIN_ID,
  SVGNFTABI,
  publicClient,
}: UseMintProps) {
  const handleMint = async (svgData: string) => {
    setAlert(null);
    console.log('Starting mint process...', { isConnected, address });

    if (!svgData || typeof svgData !== 'string') {
      console.error('Invalid SVG data');
      setAlert({ message: 'Invalid SVG data provided.', type: 'error' });
      return false;
    }

    if (!connectors.length) {
      console.error('No connectors available');
      setAlert({ message: 'No wallet connectors available. Please check your configuration.', type: 'error' });
      return false;
    }

    if (!isConnected) {
      if (!window.ethereum) {
        console.error('No wallet detected');
        setAlert({ message: 'No wallet detected. Please install MetaMask or another compatible wallet.', type: 'error' });
        return false;
      }

      const connector = connectors.find(c => c.id === 'metaMask') || 
                       connectors.find(c => c.id === 'injected') || 
                       connectors[0];
      if (!connector) {
        console.error('No supported wallet connector found', { connectors: connectors.map(c => c.id) });
        setAlert({ message: 'No supported wallet found. Please install MetaMask or another compatible wallet.', type: 'error' });
        return false;
      }

      try {
        console.log('Attempting to connect with connector:', connector.id);
        setAlert({ message: 'Connecting wallet... Please approve in your wallet.', type: 'success' });
        await connect({ connector });
        console.log('Wallet connection initiated, waiting for confirmation...');

        if (!isConnected) {
          console.error('Wallet connection failed or timed out');
          setAlert({ message: 'Wallet connection failed. Please try again or ensure your wallet is unlocked.', type: 'error' });
          return false;
        }

        console.log('Wallet connected, address:', address);
        setAlert({ message: 'Wallet connected successfully.', type: 'success' });
      } catch (connectError: any) {
        console.error('Wallet connection error:', connectError);
        setAlert({ message: 'Failed to connect wallet.', type: 'error' });
        return false;
      }
    }

    console.log('Current chain ID:', chainId, 'Target chain ID:', CHAIN_ID);
    if (chainId === undefined || chainId !== CHAIN_ID) {
      if (!window.ethereum) {
        console.error('No wallet provider detected for chain switch');
        setAlert({ message: 'Wallet provider not detected. Please ensure MetaMask is installed.', type: 'error' });
        return false;
      }

      try {
        console.log('Attempting to switch to chain ID:', CHAIN_ID);
        await switchChainAsync({ chainId: CHAIN_ID });
        setAlert({ message: 'Switched to Monad Testnet.', type: 'success' });
      } catch (switchError: any) {
        console.error('Switch chain error:', switchError);
        if (switchError.name === 'SwitchChainError' && switchError.message.includes('Chain not configured')) {
          console.log('Chain not configured, attempting to add Monad Testnet to wallet');
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${CHAIN_ID.toString(16)}`,
                  chainName: monadTestnet.name,
                  nativeCurrency: monadTestnet.nativeCurrency,
                  rpcUrls: monadTestnet.rpcUrls.default.http,
                  blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
                },
              ],
            });
            console.log('Chain added, attempting to switch again');
            try {
              await switchChainAsync({ chainId: CHAIN_ID });
              setAlert({ message: 'Switched to Monad Testnet after adding chain.', type: 'success' });
            } catch (retryError) {
              console.error('Retry switch error:', retryError);
              setAlert({ message: 'Monad Testnet added to wallet. Please switch to it manually in your wallet.', type: 'error' });
              return false;
            }
          } catch (addChainError: any) {
            console.error('Add chain error:', addChainError);
            setAlert({ message: 'Failed to add Monad Testnet.', type: 'error' });
            return false;
          }
        } else {
          setAlert({ message: 'Failed to switch to Monad Testnet.', type: 'error' });
          return false;
        }
      }
    }

    if (!address) {
      console.error('No valid address provided for minting');
      setAlert({ message: 'No valid wallet address. Please connect your wallet.', type: 'error' });
      return false;
    }

    try {
      getAddress(CONTRACT_ADDRESS);
    } catch (error) {
      console.error('Invalid contract address:', CONTRACT_ADDRESS);
      setAlert({ message: 'Invalid contract address provided.', type: 'error' });
      return false;
    }

    // Mint NFT
    try {
      setAlert({ message: 'Estimating gas...', type: 'success' });
      console.log('Estimating gas for safeMint:', { address, CONTRACT_ADDRESS, svgData });
      let gasLimit: bigint;
      try {
        const estimatedGas = await publicClient.estimateContractGas({
          address: CONTRACT_ADDRESS,
          abi: SVGNFTABI,
          functionName: 'safeMint',
          args: [address, svgData],
          value: BigInt(0.001 * 10**18),
          account: address,
        });
        gasLimit = BigInt(Math.floor(Number(estimatedGas) * 1.2));
      } catch (gasEstimationError: any) {
        console.warn('Gas estimation failed, using default gas limit:', gasEstimationError);
        gasLimit = BigInt(9 * 10**18); // 10 MON max 
      }

      setAlert({ message: 'Minting NFT...', type: 'success' });
      console.log('Writing contract with gas limit:', gasLimit);
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: SVGNFTABI,
        functionName: 'safeMint',
        args: [address, svgData],
        value: BigInt(0.001 * 10**18), //0.001 MON
        gas: gasLimit,
      });

      setAlert({ message: 'Waiting for transaction confirmation...', type: 'success' });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status === 'success') {
        setAlert({ message: 'NFT minted successfully!', type: 'success' });
        return true;
      } else {
        console.error('Transaction failed:', receipt);
        setAlert({ message: 'Transaction failed. Please try again.', type: 'error' });
        return false;
      }
    } catch (mintError: any) {
      console.error('Minting error:', mintError);
      if (mintError?.message?.includes('User rejected the request')) {
        setAlert({ message: 'Transaction cancelled. Please approve the transaction in your wallet to mint the NFT.', type: 'error' });
        return false;
      }
      let errorMessage = 'Minting failed';
      if (mintError.message?.includes('out of gas')) {
        errorMessage = 'Transaction failed: Out of gas. Try increasing gas limit.';
      } else if (mintError.message) {
        errorMessage = mintError.message;
      }
      setAlert({ message: errorMessage, type: 'error' });
      return false;
    }
  };

  return { handleMint };
}
import { Connector, useAccount, useConnect, useSwitchChain, useWriteContract } from 'wagmi';
import { PublicClient } from 'viem';
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
  CONTRACT_ADDRESS: string;
  CHAIN_ID: number;
  SVGNFTABI: any;
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
    if (chainId !== CHAIN_ID) {
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
    
    // Mint NFT
    try {
      setAlert({ message: 'Estimating gas...', type: 'success' });
      console.log('Estimating gas for safeMint:', { address, CONTRACT_ADDRESS, svgData });
      const estimatedGas = await publicClient.estimateContractGas({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SVGNFTABI,
        functionName: 'safeMint',
        args: [address, svgData],
        value: BigInt(0.001 * 10**18),
        account: address,
      });
      const gasLimit = BigInt(Math.floor(Number(estimatedGas) * 1.2));
      setAlert({ message: 'Minting NFT...', type: 'success' });
      console.log('Writing contract with gas limit:', gasLimit);
      await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: SVGNFTABI,
        functionName: 'safeMint',
        args: [address, svgData],
        value: BigInt(0.001 * 10**18),
        gas: gasLimit,
      });
      setAlert({ message: 'NFT minted successfully!', type: 'success' });
      return true;
    } catch (gasError: any) {
      console.error('Gas estimation or minting error:', gasError);
      if (gasError?.message?.includes('User rejected the request')) {
        setAlert({ message: 'Transaction cancelled. Please approve the transaction in your wallet to mint the NFT.', type: 'error' });
        return false;
      }
      setAlert({ message: 'Gas estimation failed, trying with fixed gas limit...', type: 'error' });
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: SVGNFTABI,
          functionName: 'safeMint',
          args: [address, svgData],
          value: BigInt(0.001 * 10**18),
          gas: BigInt(100000000),
        });
        setAlert({ message: 'NFT minted successfully!', type: 'success' });
        return true;
      } catch (fallbackError: any) {
        console.error('Fallback minting error:', fallbackError);
        if (fallbackError?.message?.includes('User rejected the request')) {
          setAlert({ message: 'Transaction cancelled. Please approve the transaction in your wallet to mint the NFT.', type: 'error' });
          return false;
        }
        let errorMessage = 'Minting failed with fallback gas limit';
        if (fallbackError.message?.includes('out of gas')) {
          errorMessage = 'Transaction failed: Out of gas. Try increasing gas limit.';
        } else if (fallbackError.message) {
          errorMessage = fallbackError.message;
        }
        setAlert({ message: errorMessage, type: 'error' });
        return false;
      }
    }
  };

  return { handleMint };
}
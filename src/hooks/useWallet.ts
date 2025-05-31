
import { useAccount, useDisconnect, useBalance } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    balance,
    disconnect,
  };
};

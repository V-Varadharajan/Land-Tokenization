import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { connectWallet as connectMetaMask, getContractOwner, getNetwork } from "@/lib/blockchain";
import { toast } from "react-toastify";

interface WalletContextType {
  account: string | null;
  isOwner: boolean;
  network: string;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [network, setNetwork] = useState("Not connected");
  const [contractOwner, setContractOwner] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
    
    return () => {
      removeEventListeners();
    };
  }, []);

  useEffect(() => {
    if (account) {
      fetchContractOwner();
      fetchNetwork();
    }
  }, [account]);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const fetchContractOwner = async () => {
    try {
      const owner = await getContractOwner();
      setContractOwner(owner.toLowerCase());
    } catch (error) {
      console.error("Error fetching contract owner:", error);
    }
  };

  const fetchNetwork = async () => {
    try {
      const networkInfo = await getNetwork();
      const networkNames: Record<number, string> = {
        1: "Ethereum Mainnet",
        5: "Goerli Testnet",
        11155111: "Sepolia Testnet",
        137: "Polygon Mainnet",
        80001: "Polygon Mumbai",
        31337: "Localhost",
      };
      setNetwork(networkNames[networkInfo.chainId] || `Chain ID: ${networkInfo.chainId}`);
    } catch (error) {
      console.error("Error fetching network:", error);
    }
  };

  const setupEventListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
  };

  const removeEventListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    window.ethereum.removeListener("chainChanged", handleChainChanged);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      toast.info("Wallet disconnected");
    } else {
      setAccount(accounts[0]);
      toast.success(`Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask is not installed. Please install MetaMask to continue.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setConnecting(true);
    try {
      const address = await connectMetaMask();
      setAccount(address);
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        toast.error("Connection rejected. Please approve the connection in MetaMask.");
      } else {
        toast.error("Failed to connect wallet. Please try again.");
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContractOwner(null);
    setNetwork("Not connected");
    toast.info("Wallet disconnected");
  };

  const isOwner = !!(account && contractOwner && account.toLowerCase() === contractOwner);

  return (
    <WalletContext.Provider
      value={{ account, isOwner, network, connecting, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

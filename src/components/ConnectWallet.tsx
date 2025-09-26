import React, { useState, useEffect } from "react";
import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface ConnectWalletProps {
  setAccount: React.Dispatch<React.SetStateAction<string | null>>;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ setAccount }) => {
  const [account, localSetAccount] = useState<string | null>(null);

  // Proverava da li je MetaMask već povezan
  useEffect(() => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      web3.eth.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          localSetAccount(accounts[0]);
          setAccount(accounts[0]);
        }
      });
    }
  }, [setAccount]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        localSetAccount(accounts[0]);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User rejected connection", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary text-white hover:opacity-90 border-0"
    >
      {account
        ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
};

export default ConnectWallet;

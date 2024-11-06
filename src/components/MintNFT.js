import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ContractABI from './MembershipNFT.json';

const chainConfigs = {
  Ethereum: { chainId: "0xaa36a7", contractAddress: '0xa6013D3e22EAC3d3f700b8982BA46B2B4c1b59c2' }, // Sepolia Testnet ID
  Polygon: { chainId: "0x13881", contractAddress: '0x2964b4474485BF1763f1A85AE76b264d2f5A77F1' }, // Polygon Mumbai Testnet
  Binance: { chainId: "0x61", contractAddress: '0xaf41061fBa16EA52b737329a28E9F2E689bbd4AE' }, // Binance Smart Chain Testnet
  Arbitrum: { chainId: "0x66eef", contractAddress: '0xEfb069A0D46b8aa2b311281158705b2eC8bF78D7' } // Arbitrum Sepolia Testnet
};

const MintNFT = () => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedChain, setSelectedChain] = useState("Ethereum");

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const switchNetwork = async (chainName) => {
    try {
      const config = chainConfigs[chainName];
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.chainId }],
      });
      setSelectedChain(chainName);
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Add the network if it’s not available in MetaMask
        try {
          const config = chainConfigs[chainName];
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: config.chainId,
                chainName: chainName,
                rpcUrls: [getRPCUrl(chainName)],
                nativeCurrency: getNativeCurrency(chainName),
                blockExplorerUrls: [getBlockExplorerUrl(chainName)],
              },
            ],
          });
          setSelectedChain(chainName);
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      } else {
        console.error("Failed to switch network:", switchError);
      }
    }
  };

  const getRPCUrl = (chainName) => {
    switch (chainName) {
      case "Ethereum":
        return "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"; // Replace with your Infura ID
      case "Polygon":
        return "https://rpc-mumbai.maticvigil.com";
      case "Binance":
        return "https://bsc-testnet.publicnode.com";
      case "Arbitrum":
        return "https://arbitrum-sepolia.blockpi.network/v1/rpc/public";
      default:
        return "";
    }
  };

  const getNativeCurrency = (chainName) => {
    switch (chainName) {
      case "Ethereum":
        return { name: "SepoliaETH", symbol: "SepoliaETH", decimals: 18 };
      case "Polygon":
        return { name: "MATIC", symbol: "MATIC", decimals: 18 };
      case "Binance":
        return { name: "tBNB", symbol: "tBNB", decimals: 18 };
      case "Arbitrum":
        return { name: "ETH", symbol: "ETH", decimals: 18 };
      default:
        return {};
    }
  };

  const getBlockExplorerUrl = (chainName) => {
    switch (chainName) {
      case "Ethereum":
        return "https://sepolia.etherscan.io";
      case "Polygon":
        return "https://mumbai.polygonscan.com";
      case "Binance":
        return "https://testnet.bscscan.com";
      case "Arbitrum":
        return "https://sepolia-explorer.arbitrum.io";
      default:
        return "";
    }
  };

  const mintNFT = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    const config = chainConfigs[selectedChain];
    await switchNetwork(selectedChain);

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(config.contractAddress, ContractABI, signer);

      const options = {
        gasLimit: 3000000,
        value: ethers.utils.parseEther("0.00001"), // Example minting fee
      };

      const tx = await contract.mintMembership(walletAddress, "https://example.com/tokenURI", options);
      await tx.wait();

      alert("Minting successful!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Minting failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Mint Your Lifetime Access NFT</h2>
      {walletAddress ? (
        <p>Connected as: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      <div>
        <h3>Select Chain</h3>
        {Object.keys(chainConfigs).map((chain) => (
          <button
            key={chain}
            onClick={() => switchNetwork(chain)}
            style={{
              backgroundColor: selectedChain === chain ? "blue" : "gray",
              color: "white",
              margin: "5px",
              padding: "10px",
            }}
          >
            {chain}
          </button>
        ))}
      </div>
      <button onClick={mintNFT} disabled={loading}>
        {loading ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
};

export default MintNFT;

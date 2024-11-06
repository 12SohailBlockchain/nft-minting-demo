import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ContractABI from './MembershipNFT.json';

const MintNFT = () => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [mintedCount, setMintedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");

  // Token URI for the NFT to be minted
  const tokenURI = "https://scarlet-statutory-jackal-499.mypinata.cloud/ipfs/QmSWuWmdmbemStXimmUPF2Ec8FPTtuqecetU2fM8bomPf7";

  const networkConfig = {
    Ethereum: {
      contractAddress: '0xa6013D3e22EAC3d3f700b8982BA46B2B4c1b59c2',
      chainId: 11155111
    },
    "Binance Smart Chain": {
      contractAddress: '0xaf41061fBa16EA52b737329a28E9F2E689bbd4AE',
      chainId: 97
    },
    Polygon: {
      contractAddress: '0x2964b4474485BF1763f1A85AE76b264d2f5A77F1',
      chainId: 80002
    },
    Arbitrum: {
      contractAddress: '0xEfb069A0D46b8aa2b311281158705b2eC8bF78D7',
      chainId: 421614
    }
  };

  const mintingFee = ethers.utils.parseEther("0.00001");

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
      checkMintedCount(accounts[0]);
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const getNetworkVersion = async () => {
    try {
      const networkVersion = await window.ethereum.request({ method: 'net_version' });
      return parseInt(networkVersion, 10);
    } catch (error) {
      console.error("Error fetching network version:", error);
      return null;
    }
  };

  const checkMintedCount = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(networkConfig[selectedNetwork].contractAddress, ContractABI, provider);
      const count = await contract.mintedNFTs(address);
      setMintedCount(count.toNumber());
    } catch (error) {
      console.error("Error fetching minted count:", error);
    }
  };

  const mintNFT = async () => {
    if (!walletAddress) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }

    if (mintedCount >= 2) {
      setErrorMessage("You have reached the limit of 2 NFTs.");
      return;
    }

    const currentChainId = await getNetworkVersion();
    if (currentChainId !== networkConfig[selectedNetwork].chainId) {
      setErrorMessage(`Please switch to ${selectedNetwork} network in MetaMask.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(networkConfig[selectedNetwork].contractAddress, ContractABI, signer);

      const options = {
        gasLimit: 3000000,
        value: mintingFee,
      };

      const tx = await contract.mintMembership(walletAddress, tokenURI, options);
      await tx.wait();

      alert("Minting successful!");
      setMintedCount(mintedCount + 1);
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Minting failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkChange = (event) => {
    setSelectedNetwork(event.target.value);
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
        <label>Select Network: </label>
        <select value={selectedNetwork} onChange={handleNetworkChange}>
          {Object.keys(networkConfig).map((network) => (
            <option key={network} value={network}>
              {network}
            </option>
          ))}
        </select>
      </div>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <button onClick={mintNFT} disabled={loading || !walletAddress || mintedCount >= 2}>
        {loading ? "Minting..." : "Mint NFT"}
      </button>
      <p>Minted NFTs: {mintedCount}/2</p>
    </div>
  );
};

export default MintNFT;

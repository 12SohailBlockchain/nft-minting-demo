import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ContractABI from './MembershipNFT.json';

const MintNFT = () => {
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [mintedCount, setMintedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Token URI for the NFT to be minted
  const tokenURI = "https://scarlet-statutory-jackal-499.mypinata.cloud/ipfs/QmUdm5Dbq4VAkpd7q7YWveF8ztnDBnZC7FikW3RkHPSXWt";
  const contractAddress = '0xa6013D3e22EAC3d3f700b8982BA46B2B4c1b59c2';
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

  const checkMintedCount = async (address) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, ContractABI, provider);
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

    try {
      setLoading(true);
      setErrorMessage("");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ContractABI, signer);

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

  return (
    <div>
      <h2>Mint Your Lifetime Access NFT</h2>
      {walletAddress ? (
        <p>Connected as: {walletAddress}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <button onClick={mintNFT} disabled={loading || !walletAddress || mintedCount >= 2}>
        {loading ? "Minting..." : "Mint NFT"}
      </button>
      <p>Minted NFTs: {mintedCount}/2</p>
    </div>
  );
};

export default MintNFT;

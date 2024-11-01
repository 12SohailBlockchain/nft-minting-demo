import React, { useState } from 'react';
import { ethers } from 'ethers';
import ContractABI from './MembershipNFT.json';

const MintNFT = () => {
  const [loading, setLoading] = useState(false);

  // Hardcoded values for testing
  const recipientAddress = "0xC2F29DA2893eED7e8B2BE961e99a9Ee66bF635d9";
  const tokenURI = "https://scarlet-statutory-jackal-499.mypinata.cloud/ipfs/QmUdm5Dbq4VAkpd7q7YWveF8ztnDBnZC7FikW3RkHPSXWt";

  const mintNFT = async () => {
    try {
      setLoading(true);

      // Connect to Ethereum provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Define contract address and create a contract instance
      const contractAddress = '0xa6013D3e22EAC3d3f700b8982BA46B2B4c1b59c2'; // Replace with your actual contract address
      const contract = new ethers.Contract(contractAddress, ContractABI, signer);

      // Set gas limit options
      const options = { gasLimit: 3000000 }; // Adjust based on Etherscan or your testing

      // Call mintMembership with recipientAddress and tokenURI only
      const tx = await contract.mintMembership(recipientAddress, tokenURI, options);
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
      <button onClick={mintNFT} disabled={loading}>
        {loading ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
};

export default MintNFT;

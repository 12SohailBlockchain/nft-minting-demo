import React from "react";
import { ethers } from "ethers";

const WalletConnect = ({ onConnect }) => {
    const connectWallet = async () => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const walletAddress = await signer.getAddress();
            onConnect(walletAddress);
        } else {
            alert("Please install MetaMask!");
        }
    };

    return <button onClick={connectWallet}>Connect Wallet</button>;
};

export default WalletConnect;

import React, { useState } from "react";
import { ethers } from "ethers";
import MintNFT from "./components/MintNFT";
import WalletConnect from "./components/WalletConnect";
import "./App.css";

function App() {
    const [walletAddress, setWalletAddress] = useState("");

    const handleConnect = (address) => {
        setWalletAddress(address);
    };

    return (
        <div className="App">
            <h1>Mint Your Lifetime Access NFT</h1>
            <WalletConnect onConnect={handleConnect} />
            {walletAddress && <MintNFT walletAddress={walletAddress} />}
        </div>
    );
}

export default App;

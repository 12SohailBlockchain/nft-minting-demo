require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function uploadToPinata() {
    const metadata = {
        name: "Lifetime Access NFT",
        description: "Exclusive Lifetime Access to Gold Tier Benefits",
        image: "./images/nft-image.jpg" // Relative path based on your project structure
    };

    try {
        // Pin image file
        const form = new FormData();
        form.append("file", fs.createReadStream(metadata.image));

        const pinFileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", form, {
            headers: {
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
                ...form.getHeaders(),
            },
        });

        metadata.image = `https://gateway.pinata.cloud/ipfs/${pinFileResponse.data.IpfsHash}`;

        // Pin JSON metadata
        const pinJSONResponse = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
            headers: {
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            },
        });

        console.log(`Metadata URL: https://gateway.pinata.cloud/ipfs/${pinJSONResponse.data.IpfsHash}`);
    } catch (error) {
        console.error("Error uploading to Pinata:", error);
    }
}

uploadToPinata();

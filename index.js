// Objective:
// 1. Create buttons and functions to connect with blockchain using Metamask
// 2. Create functions: Connect, Fund, Balance, Withdraw

// const {ethers } = require("ethers"); // node.js code
import { ethers } from "./ethers-5.1.esm.min.js"; // front-end html js (es6) code
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fundUI;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers); // Not required imo

// Connect function
// Wrapped in async function so that metamask opens only when called and not on each refresh
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Metamask Detected!");
    await window.ethereum.request({ method: "eth_requestAccounts" }); // calls metamasl
    console.log("Metamask Connected!");
    connectButton.innerHTML = "Connected!";
  } else {
    console.log("No Metamask Detected!");
    connectButton.innerHTML = "Please install Metamask";
  }
}

// getBalance function
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

// Fund function
async function fundUI() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}.....`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Provider (1/3)
    const signer = provider.getSigner(); // Signer (2/3)
    console.log(signer);
    const contract = new ethers.Contract(contractAddress, abi, signer); // Contract (3/3)
    try {
      const transactionResponse = await contract.fundUSD({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider); // listening for txn to be mined
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

// Listen for a txn to be mined; Or listen for an event.
function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}....`);

  return new Promise((resolve, reject) => {
    // new Promise as we want for this func to be finshed first
    provider.once(
      transactionResponse.hash,
      /*listener here*/ (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations`
        );
        resolve();
      } // creating a listener for blockchain
    );
  });
}

// Withdraw function
async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Provider (1/3)
    const signer = provider.getSigner(); // Signer (2/3)
    const contract = new ethers.Contract(contractAddress, abi, signer); // Contract (3/3)
    try {
      console.log("Withdrawing ETH........");

      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

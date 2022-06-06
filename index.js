//in node js - we use require() to import
// in front-end javascript you cant use require - use import
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a metamask!")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        //console.log("Connected to metamask");
        connectButton.innerHTML = "Connected!"
    } else {
        //console.log("No metamask!");
        connectButton.innerHTML = "Please install metamask!"
    }
}

//fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        //provider/connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //signer / wallet / someone with gas
        const signer = provider.getSigner() //gets metamask
        //contract that we are interacting with
        // ^ABI & Address
        const contract = new ethers.Contract(contractAddress, abi, signer) // ?
        try {
            //interact with contract
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //listen for tx to be mined
            await listenForTxmine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

//not async
function listenForTxmine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    //create a listener for this tx to finish
    //wait for the listener to finish listening
    return new Promise((resolve, reject) => {
        provider.once(txResponse.hash, (txReceipt) => {
            console.log(
                `Completed with ${txReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

//withdraw
async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner() //gets metamask
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txResponse = await contract.withdraw()
            await listenForTxmine(txResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

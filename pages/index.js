import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import NavBar from '@components/NavBar'

import { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
//import { fetch } from "node-fetch";

// Reference to deployed contract
// NOTE: having issues? make sure you deployed your contract and make sure to
// check the network you are on.
import { contractAddrClosedRinkeby, contractAddrOpenedRinkeby, etherscanKey } from "../config";
import DimensionDoors from "../contracts/artifacts/DimensionDoors_metadata.json";

import DimensionDoorsOpened from "../contracts/artifacts/DimensionDoorsOpened_metadata.json";
import DoorPanel from '@components/DoorPanel';


export async function getStaticProps(context) {

  
  function getClosedURI() {
    return "https://ipfs.io/ipfs/QmeqMKPQHxCX7aYv4QKgPEMdKBmREe2LTfq8CBvH4hSy5y/";
  }

  async function getClosedMetadata(tokenId) {
    let status;
    return fetch(getClosedURI().concat(tokenId.toString()))
    .then((res) => { 
      status = res.status; 
      return res.json() 
    })
    .then((jsonData) => {
      //console.log(jsonData);
      //console.log(status);
      return jsonData;
    })
    .catch((err) => {
      // handle error
      console.error(err);
    });
  }

  async function getClosedImage(tokenId) {
    //console.log("test");
    //console.log(getClosedMetadata(tokenId).image);
    const meta = await getClosedMetadata(tokenId);
    console.log(meta.image)
    return meta.image;
  }

  function getOpenedURI() {
    return "https://ipfs.io/ipfs/QmRtkfhtBKNaVr3qJ8sABuBaviZCCFpPtvkJLe5QYxnWPn/";
  }

  async function getOpenMetadata(tokenId) {
    let status;
    return fetch(getOpenedURI().concat(tokenId.toString()))
    .then((res) => { 
      status = res.status; 
      return res.json() 
    })
    .then((jsonData) => {
      //console.log(jsonData);
      //console.log(status);
      return jsonData;
    })
    .catch((err) => {
      // handle error
      console.error(err);
    });
  }



  async function getOpenedImage(tokenId) {
    const meta = await getopenMetadata(tokenId);
    return meta.image;
  }

  var currentBatch = 1;
  const closedTokenSupply = 4 + 10 * currentBatch;
  const openTokenSupply = currentBatch * 60;

  async function buildClosedMeta(){
    //console.log('Start')
    var meta = {};
    for (let i = 0; i < closedTokenSupply; i++) {
      meta[i] = await getClosedMetadata(i);
    }
    return meta;
  }

  async function buildOpenMeta(){
    //console.log('Start')
    var meta = {};
    for (let i = 0; i < openTokenSupply; i++) {
      meta[i] = await getOpenMetadata(i);
    }
    return meta;
  }

  const closedMeta = await buildClosedMeta();
  const openMeta = await buildOpenMeta();

  var currentClosedSupplies = [];
  var currentOpenSupplies = []

  const network = "rinkeby";
//  const provider = new ethers.providers.JsonRpcProvider();

// Specify your own API keys
// Each is optional, and if you omit it the default
// API key for that service will be used.
const provider = ethers.getDefaultProvider(network, {
  etherscan: etherscanKey,
  //infura: YOUR_INFURA_PROJECT_ID,
  // Or if using a project secret:
  // infura: {
  //   projectId: YOUR_INFURA_PROJECT_ID,
  //   projectSecret: YOUR_INFURA_PROJECT_SECRET,
  // },
  //alchemy: YOUR_ALCHEMY_API_KEY,
  //pocket: YOUR_POCKET_APPLICATION_KEY
  // Or if using an application secret key:
  // pocket: {
  //   applicationId: ,
  //   applicationSecretKey:
  // }
});

  //console.log(contractAddrClosedRinkeby);
  //console.log(DimensionDoors.output.abi);
  //console.log(provider);
  const closedContract = new ethers.Contract(contractAddrClosedRinkeby, DimensionDoors.output.abi, provider)
  const openedContract = new ethers.Contract(contractAddrOpenedRinkeby, DimensionDoorsOpened.output.abi, provider)

  const pricesBigNumber = await closedContract.getPrices();
  console.log(pricesBigNumber);
  const converter = ethers.BigNumber.from("1000000000000000");
  var prices = []
  for (let i = 0; i < 8; i++) {
    const price = pricesBigNumber[i].div(converter).toNumber() * 0.001;
    //console.log(price);
    prices.push(price);
  }

  for (let i = 0; i < closedTokenSupply; i++) {
    const availableSupply = await closedContract.tokenSupply(i);
    const burnedSupply = await closedContract.burnedSupply(i);
    //console.log(supply);
    currentClosedSupplies.push(availableSupply.toNumber() + burnedSupply.toNumber());
  }

  for (let i = 0; i < openTokenSupply; i++) {
    const exists = await openedContract.exists(i);
    if (exists) {
      currentOpenSupplies.push(1);
    }
    else {
      currentOpenSupplies.push(0);
    }

    //console.log(exists);

  var canMintAndUnlock = []
/*
  for (let i = 0; i < openTokenSupply; i++)
  {
    const meta = openMeta[i];
    const keySupply
    const closedSupply = currentClosedSupplies[meta.closed_id]

  }
*/
  }

  async function getGas(url) {
    let status;
    return fetch(url)
    .then((res) => { 
      status = res.status; 
      return res.json() 
    })
    .then((jsonData) => {
      //console.log(jsonData);
      //console.log(status);
      return jsonData;
    })
    .catch((err) => {
      // handle error
      console.error(err);
    });
  }
  /*
  const adresses = ["0x7a250d5630b4cf539739df2c5dacb4c659f2488d", "0xdac17f958d2ee523a2206206994597c13d831ec7", "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b",
                    "0xe592427a0aece92de3edee1f18e0157c05861564", "0x881d40237659c251811cec9c364ef91dc08d300c", "0x1111111254fb6c44bac0bed2854e76f90643097d", 
                  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "0xfbddadd80fe7bda00b901fbaf73803f2238ae655", "0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f",
                "0x9b9647431632af44be02ddd22477ed94d14aacaa", "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da", "0xa5409ec958c83c3f309868babaca7c86dcb077c1", 
              "0xa57bd00134b2850b2a1c55860c9e9ea100fdd6cf", "0xe66b31678d6c16e9ebf358268a790b763c133750", "0x653430560be843c4a3d143d0110e896c2ab8ac0d",
            "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b", "0x0000000000000000000000000000000000000000"]

  var baseUrl = "http://api.etherscan.io/api?module=account&action=txlist&address=[ADRESS]&startblock=0&endblock=99999999&sort=desc&apikey=DED8FFEEZ2ZC88GIQY4X4GKRSPWEI62GGG"
  //const result = await getGas(url)
 // var gas = result["result"]
  //console.log(gas);
  const test = 0
  for (let i = 0; i < adresses.length; i++) {
    //if (i != test) {
    //  continue
    //}
    const url = baseUrl.replace("[ADRESS]", adresses[i])
    const result = await getGas(url)
    var gas = result["result"]
    for (let i2 = 0; i2 < gas.length; i2++) {
      const tx = gas[i2]
      const timestamp = Number(tx["timeStamp"])
      const gasPrice = Number(tx["gasPrice"])
      //console.log(tx["timeStamp"])
      if (timestamp > 1637708400 && (gasPrice / 1000000000 < 70)) {
        //continue;
        console.log(gasPrice / 1000000000)
      }
    }
  }*/



  return {
    props: {closedMeta, openMeta, currentBatch, currentClosedSupplies, currentOpenSupplies, prices}, // will be passed to the page component as props
  }
}



/*
import { createTheme, ThemeProvider, makeStyles } from '@material-ui/core/styles';
import {Typography} from '@material-ui/core'; 

const theme = createTheme({
  palette: {
    primary: {
      main:"#f4e6d4",
    },
    secondary: {
      main:"#713951",
    },
  },
  typography: {
    fontFamily: [
      'Poppins'
    ],
    h4: {
      fontWeight: 600,
      fontSize: 28,
      lineHeight: '2rem',
      },
    h5: {
      fontWeight: 100,
      lineHeight: '2rem',
    },
  },
});

const styles = makeStyles({
  wrapper: {
    width: "50%",
    marginTop: "auto",
    marginLeft : "5%",
    textAlign: "left"
  },
  bigSpace: {
    marginTop: "5rem"
  },
  littleSpace:{
    marginTop: "2.5rem",
  },
  smallSpace:{
    marginTop: "0.5rem",
  },
  grid:{
    display: "flex", 
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap", 
  },
  gridleft:{
    display: "flex", 
    justifyContent: "left",
    alignItems: "left",
    flexWrap: "wrap", 
  },
})
*/
export default function Home({closedMeta, openMeta, currentBatch, currentClosedSupplies, currentOpenSupplies, prices}) {
  //const classNamees = styles(); 
  
  // web modal helper.
  // TODO: config cache

  var closedPanels = { 'test' : null };

  async function updateClosedPanel(arg, tokenId, price) {


    if (arg == "mint") {
      await mintSingle(tokenId, price);
    }
    //console.log(tokenId);
    //closedPanels[tokenId] = panel;
    //return this;
  }
  

  var openPanels = { 'test' : null };

  async function updateOpenPanel(arg, tokenId, keyId, doorOption) {
    if (arg == "unlock") {
      await unlockSingle(tokenId, keyId, doorOption);
    }
    //console.log(tokenId);
    //openPanels[tokenId] = panel;
    //console.log(panel)
    //return this;
  }

  console.log(closedPanels);
  console.log(openPanels);
  
  const [errorMsg, setErrorMsg] = useState(undefined);
  const [mintForm, updateMintForm] = useState({
    price: "",
    numToMint: "1",
  });

  var selectedClosedTokens = [];
  var selectedOpenTokens = [];

  var introImage = "https://ipfs.io/ipfs/bafybeiexyrczk5gqa7sfmqihffv2qaoqvb5ne4in2sogh34okoim7qxxnu/A2_1.png"


  async function getProvider() {
    //return provider;
    
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    return new ethers.providers.Web3Provider(connection);
  }

  var closedContract;
  var openedContract;
  //const init = await initializeContracts();

  
  async function unlockSingle(tokenId, keyId, doorOption) {
    //const { numToMint } = mintForm;
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "rinkeby") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return;
    }
    const contract = new ethers.Contract(
      contractAddrClosedRinkeby,
      DimensionDoors.output.abi,
      provider.getSigner()
    );

    try {
      const token = await contract.unlock(Number(tokenId), Number(keyId), Number(doorOption));
      await token.wait();
    } catch (error) {
      setErrorMsg(error.message);
      console.log(error.message);
    }
  }
  

  async function mintSingle(tokenId, _price) {
    //const { numToMint } = mintForm;
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "rinkeby") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return;
    }
    const contract = new ethers.Contract(
      contractAddrClosedRinkeby,
      DimensionDoors.output.abi,
      provider.getSigner()
    );


    const converter = ethers.BigNumber.from("1000000000000000");
    const priceFinney = ethers.BigNumber.from(`${_price * 1000}`);
    const price = ethers.utils.formatUnits(`${priceFinney.mul(converter)}`, "wei");
    try {
      const token = await contract.mint([Number(tokenId)], [1], { value: price });
      await token.wait();
    } catch (error) {
      setErrorMsg(error.message);
      console.log(error.message);
    }
  }

  return (
    
    <div className="main justify-center items-center">
      <NavBar/>

      <div className="wrapper">

        <div className="md:flex justify-center items-center space-x-16 mt-5 md:mr-0 mr-10">
          <div className="md:flex justify-center items-center pl-4 pr-4 md:pl-12 md:pr-12 xl:pl-128 xl:pr-128">
            <div className="styles_container__16cxk">
              <video className="rounded-2xl styles_video__32uJf" playsInline={true} loop={true} controls={false} src="https://ipfs.io/ipfs/bafybeigegnsqf7y5vyghi7xodgg5d6h636luerkgudss6lenqyve4ndpyi/S_Transition.mp4" autoPlay={true} muted={true}> </video>
            </div>
          </div>
        </div>


        <div className="md:flex space-x-16 mt-5 md:mr-0 mr-10 pl-2 pr-2 md:pl-10 md:pr-10 xl:pl-80 xl:pr-80">
            <div className="md:flex items-center">
              <div className="">
                <h1 className="text-4xl text-textColor font-medium leading-snug tracking-wider">DIMENSION DOORS</h1>
                <p className="text-mainColor mt-4 text-lg font-normal ">Dimension Doors is a collection of 3504 NFTs—unique digital collectibles living on the Ethereum blockchain. This collection consists of 4 keys, 500 closed doors and 3000 open doors. Each closed door can have different quantities based on its className: S, A, B or C. Respectively consisting of 1, 2, 5, 10 quantities per closed door. Once you own a closed door and  key of that class, you can unlock that specific door and choose an 1/1 opened door NFT. Unlocking an open door will burn the closed door and key, and mint the open door of your choosing. Because each closed Dimension Door is hand-drawn, it will take time to finish the whole collection. That's why drops will happen in 50 batches consisting of the same ratios and quantities per class. </p><br></br>
                  
              </div>
            </div>
            <div className="max-w-lg pr-24 pb-8 md:flex justify-center items-center hidden">
              <img className="rounded-lg" src={introImage} alt=""></img>
            </div>
          </div>
        </div>

        <div className="md:pl-80 md:pr-80 sm:pl-1 sm:pr-1 justify-center items-center"><div className="border-top"></div></div>

        <div className="max-w-full mx-auto py-24 px-6">
            <h1 className="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                BUY KEYS
            </h1>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Keys are used to unlock doors, if you don't have the right key for the class, you can't use it.
            </p>
            <div className="h-1 mx-auto bg-indigo-200 w-24 opacity-75 mt-4 rounded"></div>

            <div className="max-w-full md:max-w-6xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row items-center">
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[0]} _supply={currentClosedSupplies[0]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[1]} _supply={currentClosedSupplies[1]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[2]} _supply={currentClosedSupplies[2]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[3]} _supply={currentClosedSupplies[3]}/>
                
                </div>
            </div>
        </div>
        <div className="md:pl-80 md:pr-80 sm:pl-1 sm:pr-1 justify-center items-center"><div className="border-top"></div></div>
        <div className="max-w-full mx-auto py-8 px-6">
            <h1 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                BUY CLOSED DOORS
            </h1>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                You can buy closed doors, and unlock them using the right key. There are multiple classes just like the keys.
            </p>

            <h2 className="text-center text-4xl  text-textColor mt-12 font-medium leading-snug tracking-wider">
                S-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains only 1 S-class door with a quantity of 1.
            </p>
            <div className="h-1 mx-auto bg-indigo-200 w-12 opacity-75 mt-4 rounded"></div>

            <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[4 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[4 + (currentBatch - 1) * 10]} _useVideo={false}/>    
                </div>
            </div>
        </div>
        <div className="max-w-full mx-auto px-6">
          <h2 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                A-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 2 A-class doors with a quantity of 2 each, making a total of 4.
            </p>
            <div className="max-w-full md:max-w-5xl mx-auto my-6 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[5 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[5 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[6 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[6 + (currentBatch - 1) * 10]}/>
                </div>
            </div>
        </div>
        <div className="max-w-full mx-auto px-6">
          <h2 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                B-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 3 B-class doors with a quantity of 5 each, making a total of 15.
            </p>
            <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[7 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[7 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[8 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[8 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[9 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[9 + (currentBatch - 1) * 10]}/>
                </div>
            </div>
        </div>
        <div className="max-w-full mx-auto px-6">
          <h2 className="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                C-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 4 C-class doors with a quantity of 10 each, making a total of 40.
            </p>
            <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[10 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[10 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[11 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[11 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[12 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[12 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} updateFunc={updateClosedPanel} meta={closedMeta[13 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[13 + (currentBatch - 1) * 10]}/>
                </div>
            </div>
        </div>

        <div className="md:pl-80 md:pr-80 sm:pl-1 sm:pr-1 justify-center items-center"><div className="border-top"></div></div>
        <div className="max-w-full mx-auto py-8 px-6">
            <h1 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
               UNLOCK
            </h1>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                You can unlock a door if you have a Closed Door and a Key of the same class.
            </p>

            <h2 className="text-center text-4xl  text-textColor mt-12 font-medium leading-snug tracking-wider">
                S-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains only 1 S-class door with a quantity of 1.
            </p>
            <div className="h-1 mx-auto bg-indigo-200 w-12 opacity-75 mt-4 rounded"></div>

            <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[0 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[0 + (currentBatch - 1) * 60]}  _opened={true} _useVideo={false}/>   
                </div>
            </div>
        </div>
        <div className="max-w-full mx-auto px-6">
          <h2 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                A-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 2 A-class doors with a quantity of 2 each, making a total of 4.
            </p>
            <div className="max-w-full md:max-w-5xl mx-auto my-6 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[1 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[1 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[2 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[2 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[3 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[3 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[4 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[4 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
            </div>
        </div>
        <div className="max-w-full mx-auto px-6">
          <h2 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                B-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 3 B-class doors with a quantity of 5 each, making a total of 15.
            </p>
            <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
            <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[5 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[5 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[6 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[6 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[7 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[7 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[8 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[8 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[9 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[9 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[10 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[10 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[11 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[11 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[12 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[12 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[13 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[13 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[14 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[14 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[15 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[15 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[16 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[16 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[17 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[17 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[18 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[18 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[19 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[19 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
            </div>
        </div>
        <div className="max-w-full mx-auto px-6">
          <h2 className="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                C-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 4 C-class doors with a quantity of 10 each, making a total of 40.
            </p>
            <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[20 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[20 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[21 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[21 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[22 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[22 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[23 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[23 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[24 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[24 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[25 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[25 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[26 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[26 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[27 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[27 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[28 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[28 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[29 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[29 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[30 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[30 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[31 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[31 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[32 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[32 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[33 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[33 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[34 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[34 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[35 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[35 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[36 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[36 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[37 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[37 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[38 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[38 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[39 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[39 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[40 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[40 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[41 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[41 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[42 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[42 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[43 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[43 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[44 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[44 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[45 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[45 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[46 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[46 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[47 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[47 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[48 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[48 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[49 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[49 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[50 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[50 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[51 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[51 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[52 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[52 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[53 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[53 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[54 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[54 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[55 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[55 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[56 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[56 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[57 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[57 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[58 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[58 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} updateFunc={updateOpenPanel} meta={openMeta[59 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[59 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
            </div>
        </div>

        <div className="md:pl-80 md:pr-80 sm:pl-1 sm:pr-1 justify-center items-center"><div className="border-top"></div></div>

        <div className="md:flex space-x-16 mt-5 justify-center">
            <div className="md:flex items-center">
              <div>
                <h1 className="text-4xl text-textColor font-medium leading-snug tracking-wider text-center">TEAM</h1>
                <p className="text-mainColor mt-4 text-lg font-normal">The team consists of one person, Moot. I've made the art, smart contract, and the website. You can find my socials at the bottom. </p><br></br>
                  
              </div>
            </div>
          </div>


        <Footer/>
    </div>
  )
}

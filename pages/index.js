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
import { contractAddrClosedRinkebys } from "../config";
import DimensionDoors from "../contracts/artifacts/DimensionDoors_metadata.json";

import { contractAddrOpenedRinkebys } from "../config";
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
      console.log(jsonData);
      console.log(status);
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
      console.log(jsonData);
      console.log(status);
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

  for (let i = 0; i < closedTokenSupply; i++) {
    currentClosedSupplies.push(1);
  }

  for (let i = 0; i < openTokenSupply; i++) {
    currentOpenSupplies.push(1);
  }

  return {
    props: {closedMeta, openMeta, currentBatch,  currentClosedSupplies, currentOpenSupplies}, // will be passed to the page component as props
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
export default function Home({closedMeta, openMeta, currentBatch, currentClosedSupplies, currentOpenSupplies}) {
  //const classNamees = styles(); 
  
  // web modal helper.
  // TODO: config cache

  var closedPanels = { 'test' : null };

  function updateClosedPanel(tokenId, panel) {
    console.log(tokenId);
    closedPanels[tokenId] = panel;
  }
  

  var openPanels = { 'test' : null };

  function updateOpenPanel(tokenId, panel) {
    console.log(tokenId);
    openPanels[tokenId] = panel;
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

  /*async function init()
  {
    introImage = getClosedImage(11);
  }*/


  const network = "rinkeby";

  const provider = ethers.getDefaultProvider(network, {
    etherscan: "DED8FFEEZ2ZC88GIQY4X4GKRSPWEI62GGG"
});

  async function getProvider() {
    //return provider;
    
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    return new ethers.providers.Web3Provider(connection);
  }

  var closedContract;
  var openedContract;
  //const init = await initializeContracts();

  async function initializeContracts() {
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "rinkeby") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return;
    }


    closedContract = new ethers.Contract(
      contractAddrClosedRinkebys,
      DimensionDoors.abi,
      provider.getSigner()
    );

    openedContract = new ethers.Contract(
      contractAddrOpenedRinkebys,
      DimensionDoorsOpened.abi,
      provider.getSigner()
    );

  }

  

  async function mint() {
    const { numToMint } = mintForm;
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "rinkeby") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return;
    }
    const contract = new ethers.Contract(
      contractAddrClosedRinkebys,
      DimensionDoors.abi,
      provider.getSigner()
    );

    const price_ = await contract.price();
    const price = ethers.utils.formatUnits(`${price_.mul(numToMint)}`, "wei");
    try {
      const token = await contract.mint(amount, { value: price });
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
              <video className="styles_video__32uJf" playsInline={true} loop={true} controls={false} src="https://ipfs.io/ipfs/bafybeigegnsqf7y5vyghi7xodgg5d6h636luerkgudss6lenqyve4ndpyi/S_Transition.mp4" autoPlay={true} muted={true}> </video>
            </div>
          </div>
        </div>


        <div className="md:flex space-x-16 mt-5 md:mr-0 mr-10 pl-2 pr-2 md:pl-10 md:pr-10 xl:pl-80 xl:pr-80">
            <div className="md:flex items-center">
              <div className="">
                <h1 className="text-4xl text-textColor font-medium leading-snug tracking-wider">DIMENSION DOORS</h1>
                <p className="text-mainColor mt-4 text-lg font-normal ">Dimension Doors is a collection of 3504 NFTs—unique digital collectibles living on the Ethereum blockchain. This collection consists of 4 keys, 500 closed doors and 3000 open doors. Each closed door can have different quantities based on its className: S, A, B or C. Respectively consisting of 1, 2, 5, 10 quantities per closed door. Once you own a closed door an a key of that className, you can unlock that specific door and choose an 1/1 opened door NFT. Unlocking an open door will burn the closed door and key, and mint the open door of your choosing. Because each closed Dimension Door is hand-drawn, it will take time to finish the whole collection. That's why drops will happen in 50 batches consisting of the same ratios and quantities per class. </p><br></br>
                  
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
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[0]} _supply={currentClosedSupplies[0]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[1]} _supply={currentClosedSupplies[1]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[2]} _supply={currentClosedSupplies[2]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[3]} _supply={currentClosedSupplies[3]}/>
                
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
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[4 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[4 + (currentBatch - 1) * 10]} _useVideo={false}/>    
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
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[5 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[5 + (currentBatch - 1) * 10]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[6 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[6 + (currentBatch - 1) * 10]}/>
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
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[7 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[7 + (currentBatch - 1) * 10]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[8 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[8 + (currentBatch - 1) * 10]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[9 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[9 + (currentBatch - 1) * 10]}/>
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
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[10 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[10 + (currentBatch - 1) * 10]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[11 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[11 + (currentBatch - 1) * 10]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[12 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[12 + (currentBatch - 1) * 10]}/>
                  <DoorPanel updateFunc={updateClosedPanel} meta={closedMeta[13 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[13 + (currentBatch - 1) * 10]}/>
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
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[0 + (currentBatch - 1) * 60]} _opened={true} _useVideo={false}/>   
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
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[1 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[2 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[3 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[4 + (currentBatch - 1) * 60]} _opened={true}/>
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
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[5 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[6 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[7 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[8 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[9 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[10 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[11 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[12 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[13 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[14 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[15 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[16 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[17 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[18 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[19 + (currentBatch - 1) * 60]} _opened={true}/>
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
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[20 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[21 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[22 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[23 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[24 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[25 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[26 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[27 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[28 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[29 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[30 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[31 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[32 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[33 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[34 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[35 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[36 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[37 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[38 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[39 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[40 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[41 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[42 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[43 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[44 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[45 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[46 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[47 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[48 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[49 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[50 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[51 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[52 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[53 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[54 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[55 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[56 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[57 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[58 + (currentBatch - 1) * 60]} _opened={true}/>
                  <DoorPanel updateFunc={updateOpenPanel} meta={openMeta[59 + (currentBatch - 1) * 60]} _opened={true}/>
                </div>
            </div>
        </div>


        <Footer/>
    </div>
  )
}

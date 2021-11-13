import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import NavBar from '@components/NavBar'

import { useState } from "react";
import { ethers } from "ethers";
import { Web3Modal } from "web3modal";
//import { fetch } from "node-fetch";

// Reference to deployed contract
// NOTE: having issues? make sure you deployed your contract and make sure to
// check the network you are on.
import { contractAddrClosedRinkebys } from "../config";
import DimensionDoors from "../contracts/artifacts/DimensionDoors_metadata.json";

import { contractAddrOpenedRinkebys } from "../config";
import DimensionDoorsOpened from "../contracts/artifacts/DimensionDoorsOpened_metadata.json";
import ClosedPanel from '@components/ClosedPanel';


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
    console.log('Start')
    var meta = {};
    for (let i = 0; i < closedTokenSupply; i++) {
      meta[i] = await getClosedMetadata(i);
    }
    return meta;
  }

  async function buildOpenMeta(){
    console.log('Start')
    var meta = {};
    for (let i = 0; i < openTokenSupply; i++) {
      meta[i] = await getOpenMetadata(i);
    }
    return meta;
  }


  async function getProvider() {
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    return new ethers.providers.Web3Provider(connection);
  }

  var closedContract;
  var openedContract;
  /*const init = await initializeContracts();

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

  }*/


  const closedMeta = await buildClosedMeta();

  const openMeta = await buildOpenMeta();



  return {
    props: {closedMeta, openMeta, currentBatch}, // will be passed to the page component as props
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
export default function Home({closedMeta, openMeta, currentBatch}) {
  //const classNamees = styles(); 

  var selectedClosedTokens = [];
  var selectedOpenTokens = [];



  var introImage = "https://ipfs.io/ipfs/bafybeigpifmi62xjyhk2f7horhlipalwiv2ry6g6gl6oykarcccemwbwge/1/C2.png"

  /*async function init()
  {
    introImage = getClosedImage(11);
  }*/

  // web modal helper.
  // TODO: config cache
  


  const [errorMsg, setErrorMsg] = useState(undefined);
  // Capture form state
  const [mintForm, updateMintForm] = useState({
    price: "",
    numToMint: "1",
  });

  

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
    
    <div className="main">
      <NavBar/>

      <div className="wrapper">

        <div className="md:flex space-x-16 mt-5 md:mr-0 mr-10">
          <div className="md:flex items-center pl-4 pr-4 md:pl-12 md:pr-12 xl:pl-128 xl:pr-128">
            <div className="styles_container__16cxk">
              <video className="styles_video__32uJf" playsInline={true} loop={true} controls={false} src="https://ipfs.io/ipfs/bafybeif6ln7uwezeqkeba7cdnraqqcvxa4jtxdqerml5mjhbcf7fmaahhq/S_Transition.mp4" autoPlay={true}> </video>
            </div>
          </div>
        </div>


        <div className="md:flex space-x-16 mt-5 md:mr-0 mr-10 pl-2 pr-2 md:pl-10 md:pr-10 xl:pl-80 xl:pr-80">
            <div className="md:flex items-center">
              <div className="">
                <h1 className="text-mainColor lg:text-5xl  font-bold leading-tight text-3xl">Dimension Doors</h1>
                <p className="text-mainColor mt-4 text-lg font-normal ">Dimension Doors is a collection of 3504 NFTs—unique digital collectibles living on the Ethereum blockchain. This collection consists of 4 keys, 500 closed doors and 3000 open doors. Each closed door can have different quantities based on its className: S, A, B or C. Respectively consisting of 1, 2, 5, 10 quantities per closed door. Once you own a closed door an a key of that className, you can unlock that specific door and choose an 1/1 opened door NFT. Unlocking an open door will burn the closed door and key, and mint the open door of your choosing. Because each closed Dimension Door is hand-drawn, it will take time to finish the whole collection. That's why drops will happen in 50 batches consisting of the same ratios and quantities per className. </p><br></br>
                  
              </div>
            </div>
            <div className="max-w-lg pr-24 pb-8 md:flex justify-center items-center hidden">
              <img className="rounded-lg" src={introImage} alt=""></img>
            </div>
          </div>
        </div>

        <div className="pl-80 pr-80"><div className="border-top"></div></div>

        <div class="max-w-full mx-auto py-24 px-6">
            <h1 class="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                BUY KEYS
            </h1>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Keys are used to unlock doors, if you don't have the right key for the class, you can't use it.
            </p>
            <div class="h-1 mx-auto bg-indigo-200 w-24 opacity-75 mt-4 rounded"></div>

            <div class="max-w-full md:max-w-6xl mx-auto my-3 md:px-8">
                <div class="relative flex flex-col md:flex-row items-center">
                  <ClosedPanel meta={closedMeta[0]} useVideo={true}/>
                  <ClosedPanel meta={closedMeta[1]}/>
                  <ClosedPanel meta={closedMeta[2]}/>
                  <ClosedPanel meta={closedMeta[3]}/>
                
                </div>
            </div>
        </div>
        <div className="pl-80 pr-80"><div className="border-top"></div></div>
        <div class="max-w-full mx-auto py-8 px-6">
            <h1 class="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                BUY CLOSED DOORS
            </h1>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                You can buy closed doors, and unlock them using the right key. There are multiple classes just like the keys.
            </p>

            <h2 class="text-center text-4xl  text-textColor mt-12 font-medium leading-snug tracking-wider">
                S-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains only 1 S-class door with a quantity of 1.
            </p>
            <div class="h-1 mx-auto bg-indigo-200 w-12 opacity-75 mt-4 rounded"></div>

            <div class="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={closedMeta[4]}/>    
                </div>
            </div>
        </div>
        <div class="max-w-full mx-auto px-6">
          <h2 class="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                A-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 2 A-class doors with a quantity of 2 each, making a total of 4.
            </p>
            <div class="max-w-full md:max-w-5xl mx-auto my-6 md:px-8">
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={closedMeta[5]}/>
                  <ClosedPanel meta={closedMeta[6]}/>
                </div>
            </div>
        </div>
        <div class="max-w-full mx-auto px-6">
          <h2 class="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                B-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 3 B-class doors with a quantity of 5 each, making a total of 15.
            </p>
            <div class="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={closedMeta[7]}/>
                  <ClosedPanel meta={closedMeta[8]}/>
                  <ClosedPanel meta={closedMeta[9]}/>
                </div>
            </div>
        </div>
        <div class="max-w-full mx-auto px-6">
          <h2 class="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                C-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 4 C-class doors with a quantity of 10 each, making a total of 40.
            </p>
            <div class="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={closedMeta[10]}/>
                  <ClosedPanel meta={closedMeta[11]}/>
                  <ClosedPanel meta={closedMeta[12]}/>
                  <ClosedPanel meta={closedMeta[13]}/>
                </div>
            </div>
        </div>

        <div className="pl-80 pr-80"><div className="border-top"></div></div>
        <div class="max-w-full mx-auto py-8 px-6">
            <h1 class="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
               UNLOCK
            </h1>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                You can unlock a door if you have a Closed Door and a Key of the same class.
            </p>

            <h2 class="text-center text-4xl  text-textColor mt-12 font-medium leading-snug tracking-wider">
                S-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains only 1 S-class door with a quantity of 1.
            </p>
            <div class="h-1 mx-auto bg-indigo-200 w-12 opacity-75 mt-4 rounded"></div>

            <div class="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[0 + (currentBatch - 1) * 10]} unlock={true} useVideo={true}/>   
                </div>
            </div>
        </div>
        <div class="max-w-full mx-auto px-6">
          <h2 class="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                A-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 2 A-class doors with a quantity of 2 each, making a total of 4.
            </p>
            <div class="max-w-full md:max-w-5xl mx-auto my-6 md:px-8">
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[1 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[2 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[3 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[4 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
            </div>
        </div>
        <div class="max-w-full mx-auto px-6">
          <h2 class="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                B-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 3 B-class doors with a quantity of 5 each, making a total of 15.
            </p>
            <div class="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
            <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[5 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[6 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[7 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[8 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[9 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[10 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[11 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[12 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[13 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[14 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[15 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[16 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[17 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[18 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[19 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
            </div>
        </div>
        <div class="max-w-full mx-auto px-6">
          <h2 class="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                C-class
            </h2>
            <p class="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 4 C-class doors with a quantity of 10 each, making a total of 40.
            </p>
            <div class="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[20 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[21 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[22 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[23 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[24 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[25 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[26 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[27 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[28 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[29 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[30 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[31 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[32 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[33 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[34 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[35 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[36 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[37 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[38 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[39 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[40 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[41 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[42 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[43 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[44 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[45 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[46 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[47 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[48 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[49 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[50 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[51 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[52 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[53 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[54 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
                <div class="relative flex flex-col md:flex-row justify-center items-center">
                  <ClosedPanel meta={openMeta[55 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[56 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[57 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[58 + (currentBatch - 1) * 10]} unlock={true}/>
                  <ClosedPanel meta={openMeta[59 + (currentBatch - 1) * 10]} unlock={true}/>
                </div>
            </div>
        </div>


        <Footer/>
    </div>
  )
}

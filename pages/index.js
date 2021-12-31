import { useEffect, useState } from "react";
import ReactTooltip from 'react-tooltip';

import Header from '@components/Header'
import Footer from '@components/Footer'
import NavBar from '@components/NavBar'
import ProvenanceTable from '@components/ProvenanceTable'
import DoorPanel from '@components/DoorPanel';

import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { NextSeo } from 'next-seo';

// Reference to deployed contract
// NOTE: having issues? make sure you deployed your contract and make sure to
// check the network you are on.
import { contractAddrClosed, contractAddrOpened, etherscanKey, infuraId, infuraSecret, network, keyIds, quantities, supplies } from "../config";
import DimensionDoors from "../contracts/artifacts/DimensionDoors_metadata.json";
import DimensionDoorsOpened from "../contracts/artifacts/DimensionDoorsOpened_metadata.json";

export const staticPageGenerationTimeout = 2;

export async function getStaticProps(context) {


  function getClosedURI() {
    return "https://ipfs.io/ipfs/QmbtPsrPaq2DmktPJKWadN5yiehdbyvzNUuhLgHRp5qoRi/";
  }

  async function getClosedMetadata(tokenId) {
    let status;
    return fetch(getClosedURI().concat(tokenId.toString()))
    .then((res) => { 
      status = res.status; 
      return res.json();
    })
    .then((jsonData) => {
      //console.log(jsonData);
      //console.log(status);
      return jsonData;
    })
    .catch((err) => {
      // handle error
      return null;
      //console.error(err);
    });
  }

  function getOpenedURI() {
    return "https://ipfs.io/ipfs/QmcPK9U4VPKjvtoHUcABtsFEyrqggydQuZ479bvgB3JtL7/";
  }

  async function getOpenMetadata(tokenId) {
    let status;

    return fetch(getOpenedURI().concat(tokenId.toString()))
    .then((res) => { 
      status = res.status; 
      return res.json();
    })
    .then((jsonData) => {
      //console.log(jsonData);
      //console.log(status);
      return jsonData;
    })
    .catch((err) => {
      // handle error
      return null;
      //console.error(err);
    });
  }

  async function buildClosedMeta(){
    //console.log('Start')
    var meta = await getClosedMetadata("combined");
    return meta.meta;
  }


  async function buildOpenMeta(){
    //console.log('Start')
    var meta = await getOpenMetadata("combined");
    return meta.meta;
  }

  console.log("Initializing read only provider..");
  // Specify your own API keys
  // Each is optional, and if you omit it the default
  // API key for that service will be used.
  const provider = ethers.getDefaultProvider(network, {
    etherscan: etherscanKey,
    //infura: YOUR_INFURA_PROJECT_ID,
    // Or if using a project secret:
     infura: {
       projectId: infuraId,
       projectSecret: infuraSecret,
     },
    //alchemy: YOUR_ALCHEMY_API_KEY,
    //pocket: YOUR_POCKET_APPLICATION_KEY
    // Or if using an application secret key:
    // pocket: {
    //   applicationId: ,
    //   applicationSecretKey:
    // }
  });

  var time = Date.now();

  console.log("Initializing contracts..");
  const closedContract = new ethers.Contract(contractAddrClosed, DimensionDoors.output.abi, provider)
  const openedContract = new ethers.Contract(contractAddrOpened, DimensionDoorsOpened.output.abi, provider)

  var currentBatch = 1;
  const closedTokenSupply = 4 + 10 * currentBatch;
  const openTokenSupply = currentBatch * 60;

  const masterClosedProvenance = await closedContract.CLOSEDDOORS_PROVENANCE_MASTER();
  const masterOpenProvenance = await openedContract.OPENDOORS_PROVENANCE_MASTER();
  
  console.log("Building closed meta..");
  const closedMeta = await buildClosedMeta();

  var dTime = Date.now() - time;
  time = Date.now();
  console.log(`Closed meta built taking ${Math.floor(dTime / 1000)} seconds.`);

  console.log("Building open meta..");
  const openMeta = await buildOpenMeta();

  dTime = Date.now() - time;
  time = Date.now();
  console.log(`Open meta built taking ${Math.floor(dTime / 1000)} seconds.`);

  console.log("Getting prices..");
  const pricesBigNumber = await closedContract.getPrices();
  const converter = ethers.BigNumber.from("1000000000000000");
  var prices = []
  for (let i = 0; i < 8; i++) {
    const price = pricesBigNumber[i].div(converter).toNumber() * 0.001;
    //console.log(price);
    prices.push(price);
  }

  dTime = Date.now() - time;
  time = Date.now();
  console.log(`Getting prices taking ${Math.floor(dTime / 1000)} seconds.`);


  console.log("Building closed supplies..");
  const _currentClosedSupplies = await closedContract.totalSupply();
  var currentClosedSupplies = Array(closedTokenSupply);
  for (let i = 0; i < closedTokenSupply; i++) {
    try {
      currentClosedSupplies[i] = _currentClosedSupplies[i].toNumber();
    }
    catch (error) {
      currentClosedSupplies[i] = 0
    }
  }

  dTime = Date.now() - time;
  time = Date.now();
  console.log(`Closed supplies built taking ${Math.floor(dTime / 1000)} seconds.`);

  console.log("Getting open supplies..");
  var currentOpenSupplies = await openedContract.tokenSupplies();

  dTime = Date.now() - time;
  time = Date.now();
  console.log(`Open supplies built taking ${Math.floor(dTime / 1000)} seconds.`);

  console.log("---INIT DONE---")
  return {
    props: {closedMeta, openMeta, currentBatch, currentClosedSupplies, currentOpenSupplies, prices, masterClosedProvenance, masterOpenProvenance}, // will be passed to the page component as props
  }
}
var selectedClosedTokens = {};
var selectedTokensLength = 0;
// *1000
var selectedTokensPrice = 0;



export default function Home({closedMeta, openMeta, currentBatch, currentClosedSupplies, currentOpenSupplies, prices, masterClosedProvenance, masterOpenProvenance}) {

  const [connectedAddress, setConnectedAddress] = useState("");

  const readOnlyProvider = ethers.getDefaultProvider(network, {
    etherscan: etherscanKey,
    //infura: YOUR_INFURA_PROJECT_ID,
    // Or if using a project secret:
    /*infura: {
       projectId: infuraId,
       projectSecret: infuraSecret,
    },*/
    //alchemy: YOUR_ALCHEMY_API_KEY,
    //pocket: YOUR_POCKET_APPLICATION_KEY
    // Or if using an application secret key:
    // pocket: {
    //   applicationId: ,
    //   applicationSecretKey:
    // }
  });

  var closedUpdateFuncs = {}
  var openUpdateFuncs = {}

  const [errorMsg, setErrorMsg] = useState(undefined);

  var introImage = "https://ipfs.io/ipfs/bafybeiexyrczk5gqa7sfmqihffv2qaoqvb5ne4in2sogh34okoim7qxxnu/A2_1_preview.jpg"

  var ownerClosedSupplies = [];
  var ownerOpenedSupplies = [];

  const [bulkMintEnabled, setBulkMintEnabledInternal] = useState(false);

  var navBarBulkMintFunc;

  function initNavBarBulkMintFunc(navbarFunc) {
    navBarBulkMintFunc = navbarFunc;
  }


  var randomClosed = [];
  var randomOpen = [];
  const [randomClosedTest, setRandomClosedTest] = useState(randomClosed);
  const [randomOpenTest, setRandomOpenTest] = useState(randomOpen);
  const [randomOpenPanels, setRandomOpenPanels] = useState([]);
  const [forceEffectUpdate, setForceEffectUpdate] = useState(false);
  var newPanels = [];
  useEffect(() => {

    if (randomOpen.length == 0) {
      const initialRandomOpenPanel = createRandomOpenPanel("C", 1);
      randomOpen.push(initialRandomOpenPanel[0]);
    }

    console.log(randomOpen);
    setRandomOpenTest(randomOpen);
    newPanels.length = randomOpen.length;

    for (let i = 0; i < randomOpen.length; i++) {
      const randomOption = randomOpen[i];
      if (randomOption < 0){
        newPanels[i] = (<div></div>);
      } else {
        newPanels[i] = (<DoorPanel key={openMeta[randomOption].provenance} _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[randomOption]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[randomOption]} _supply={currentOpenSupplies[randomOption]} _opened={true} _collapsed={true} _swappable={true} _fadeMeta={closedMeta[openMeta[randomOption].closed_id]}/>);
      }
    }

    //console.log(randomOpen);
    setRandomOpenPanels(newPanels);
    //console.log(randomOpen);
  }, [forceEffectUpdate]);



  function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  function NewRandomOpen(doorClass, targetLength) {
    const keyId = keyIds[doorClass];
    console.log(currentClosedSupplies[keyId]);
    if (currentClosedSupplies[keyId] == (quantities[doorClass] + supplies[doorClass]) * currentBatch) {
      return -1;
    }


    var randomOptions = [];

    switch(keyId) {
      case 0:
        // code block
        for (let i = 0; i < currentBatch; i++) {
          const option = i * 60;
          if (currentOpenSupplies[option] == 0)  {
            randomOptions.push(option);
          }
        }
        break;
      case 1:
        // code block
        for (let i = 0; i < currentBatch; i++) {
          for (let i2 = 1; i2 < 5; i2++) {
            const option = i2 + i * 60;
            if (currentOpenSupplies[option] == 0)  {
              randomOptions.push(option);
            }
          }
        }
        break;
      case 2:
        // code block
        for (let i = 0; i < currentBatch; i++) {
          for (let i2 = 5; i2 < 20; i2++) {
            const option = i2 + i * 60;
            if (currentOpenSupplies[option] == 0)  {
              randomOptions.push(option);
            }
          }
        }
        break;
      case 3:
          // code block
          for (let i = 0; i < currentBatch; i++) {
            for (let i2 = 20; i2 < 60; i2++) {
              const option = i2 + i * 60;
              if (currentOpenSupplies[option] == 0)  {
                randomOptions.push(option);
              }
            }
          }
        break;
      default:
        // this should never trigger
        console.log("ERROR WHY ARE YOU HERE");
        return -1;
    }

    console.log(randomOptions.length);
    if (randomOptions.length < targetLength || randomOptions.length == 0) {
      return -1;
    }

    randomOptions = shuffle(randomOptions);

    var counts = {};
    for (const num of randomClosed) {
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    for (const option of randomOptions) {
      const closedId = openMeta[option].closed_id;
      if (randomOpen.includes(option) || (counts[option] ? counts[option] : 0) > quantities[doorClass] - currentClosedSupplies[closedId]) {
        continue;
      }
      return option;
    }

    return -1;
  }

  function createRandomOpenPanel(doorClass, targetLength) {
    const randomOption = NewRandomOpen(doorClass, targetLength);
    console.log("random option: ", randomOption);
    if (randomOption < 0) {
      return [randomOption, -1, (<div></div>)];
    }
    const closedOption = openMeta[randomOption].closed_id;
    const openPanelTemplate = [randomOption, closedOption, (<DoorPanel key={openMeta[randomOption].provenance} _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[randomOption]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[randomOption]} _supply={currentOpenSupplies[randomOption]}  _opened={true} _collapsed={true} _swappable={true}/>)];
    return openPanelTemplate;
  }

  function updateRandomOpenPanels(doorClass, targetLength) {
    randomOpen = randomOpenTest;
    console.log("new length: ", targetLength, "randomOpen length:", randomOpen.length);
    
    const currentLength = randomOpen.length;
    if (targetLength == currentLength) {
      return false;
    }

    var randomPanels = randomOpenPanels;
    randomOpen.length = targetLength;
    randomClosed.length = targetLength;
    randomPanels.length = targetLength;
    if (targetLength < currentLength) {
      setRandomClosedTest(randomClosed);
      setRandomOpenTest(randomOpen);
      setRandomOpenPanels(randomPanels);
      return true;
    }


    console.log("current length: ", currentLength);
    for (let i = currentLength; i < targetLength; i++) {
      const panelTemplate = createRandomOpenPanel(doorClass, targetLength);
      if (panelTemplate[0] < 0) {
        continue;
      }
      randomOpen[i] = panelTemplate[0];
      randomClosed[i] = panelTemplate[1];
      randomPanels[i] = panelTemplate[2];
    }

    setRandomClosedTest(randomClosed);
    setRandomOpenTest(randomOpen);
    setRandomOpenPanels(randomPanels);
    console.log(randomOpenPanels);
    return true;
    /*
    useEffect(() => {

      }, []);
    */

  };

  function setBulkMintEnabled(enabled) {
    navBarBulkMintFunc(enabled);
    setBulkMintEnabledInternal(enabled);
  }

  function updateClosedPanel(arg, tokenId, price, init) {
    if (arg == "init") {
      closedUpdateFuncs[tokenId] = init;
      return;
    }

    if (arg == "add") {
      if (selectedTokensLength < 10) {
        if(selectedClosedTokens[tokenId]) {
          selectedClosedTokens[tokenId] = selectedClosedTokens[tokenId] + 1;
          console.log("selectedClosedToken", selectedClosedTokens[tokenId])
        } else{
          selectedClosedTokens[tokenId] = 1
          console.log("selectedClosedToken", selectedClosedTokens[tokenId])
        } 
        selectedTokensPrice = selectedTokensPrice + price * 1000;
        selectedTokensLength = selectedTokensLength + 1;
        console.log(selectedTokensPrice, " - ", selectedTokensLength);
        if (!bulkMintEnabled) {
          console.log("tokenlength add", selectedTokensLength);
          setBulkMintEnabled(true);
          console.log("tokenlength add", selectedTokensLength);
        }
        return 1;
      } else {
        return 0;
      }
    }

    if (arg == "remove") {
      console.log("tokenlength remove", selectedTokensLength);
      if (selectedTokensLength > 0) {
        try {
          if (selectedClosedTokens[tokenId] > 0) {
            selectedClosedTokens[tokenId] =  selectedClosedTokens[tokenId] - 1;
            if (selectedTokensLength == 1) {
              setBulkMintEnabled(false);
            }
            selectedTokensLength = selectedTokensLength - 1;
            selectedTokensPrice = selectedTokensPrice - price * 1000;
            console.log(selectedTokensPrice, " - ", selectedTokensLength);
            return 1;
          } else {
            console.log("selectedClosedTokensLength is 0")
            return 0;
          }
        } catch (error) {
          console.log(error);
          return 0;
        } 
      } else {
        console.log("selectedTokensLength is 0")
        return 0;
      }
    }
  }

  async function updateClosedPanelAsync(arg, tokenId, price) {
    if (arg == "mint") {
      const dSupply = await mintSingle(tokenId, price);
      return dSupply;
    }
  }

  // TokenId is closed doors tokenId unless specified
  function updateOpenPanel(arg, tokenId, keyId, doorOption, init) {
    if (arg == "init") {
      // TokenId is the opened doors tokenId
      openUpdateFuncs[tokenId] = init;
      return;
    }
    if (arg == "closedSupply") {
      const supply = currentClosedSupplies[tokenId];
      return supply;
    }
    if (arg == "keySupply") {
      const supply = currentClosedSupplies[keyId];
      return supply;
    }
    if (arg == "swap") {
      randomOpen = randomOpenTest;
      randomClosed = randomClosedTest;
      var randomPanels = randomOpenPanels;
      console.log("randomOpen: ", randomOpen);
      const matches = (element) => element == tokenId;
      console.log("swapping:", tokenId)
      const index = randomOpen.findIndex(matches);
      console.log("found index:", index);
      
      if (index == -1) {
        index = 0;
      }


      const panelTemplate = createRandomOpenPanel(keyId, randomOpen.length + 1);
      console.log("panelTemplate:", panelTemplate);
      if (panelTemplate[0] > -1) {

        randomOpen[index] = panelTemplate[0];
        randomClosed[index] = panelTemplate[1];
        randomPanels[index] = panelTemplate[2];

        console.log(panelTemplate);
    }

      setRandomOpenPanels(randomPanels);
      setRandomOpenTest(randomOpen);
      setRandomClosedTest(randomClosed);
      setForceEffectUpdate(!forceEffectUpdate);
      console.log(randomOpenPanels);
      return;
    }
  }

  async function updateOpenPanelAsync(arg, tokenId, keyId, doorOption) {
    if (arg == "unlock") {
      // tokenId here is the id of the closed door
      const dSupply = await unlockSingle(tokenId, keyId, doorOption);
      return dSupply;
    }
    if (arg == "mintUnlock") { 
      // tokenId here is the id of the closed door
      const dSupply = await mintAndUnlock(tokenId, keyId, doorOption);
      return dSupply;
    }
  }

  async function getProvider() {
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    return provider;
  }

  async function initAddress() {
    try {    if(connectedAddress == "") {
      console.log(0);
      const provider = await getProvider();
      console.log(provider);
      const signer = await provider.getSigner();
      console.log(signer);
      const address = await signer.getAddress();
      console.log(address);
      const closedReadContract = new ethers.Contract(contractAddrClosed, DimensionDoors.output.abi, readOnlyProvider);
      console.log(closedReadContract);
      const openedReadContract = new ethers.Contract(contractAddrOpened, DimensionDoorsOpened.output.abi, readOnlyProvider);
      console.log(openedReadContract);
      
      ownerClosedSupplies = await closedReadContract.tokensByOwner(address);
      console.log(ownerClosedSupplies);
      ownerOpenedSupplies = await openedReadContract.tokensByOwner(address);
      console.log(ownerOpenedSupplies);
  
      for (const [key, value] of Object.entries(closedUpdateFuncs)) {
        //console.log(`${key}: ${value}`);
        var supply = ownerClosedSupplies[key];
        if (supply == null) {
          supply = 0;
        } else {
          supply = supply.toNumber();
        }
        closedUpdateFuncs[key]("connect", [true, supply, address]);
      }
      for (const [key, value] of Object.entries(openUpdateFuncs)) {
        //console.log(`${key}: ${value}`);
        var supply = ownerOpenedSupplies[key];
        if (supply == null) {
          supply = 0;
        } else {
          supply = supply.toNumber();
        }
        openUpdateFuncs[key]("connect", [true, supply, address]);
      }
  
      setConnectedAddress(address);
      return true;
    }}
    catch (error) {
      console.log(error);
      return false;
    }
  }

  var closedContract;
  var openedContract;

  async function unlockSingle(closedId, keyId, doorOption) {
    const connected = await initAddress();
    //const { numToMint } = mintForm;
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "homestead") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return 0;
    }
    const contract = new ethers.Contract(
      contractAddrClosed,
      DimensionDoors.output.abi,
      provider.getSigner()
    );

    try {
      const token = await contract.unlock(Number(closedId), Number(keyId), Number(doorOption));
      await token.wait();
    } catch (error) {
      setErrorMsg(error.message);
      console.log(error.message);
      return 0;
    }
    return 1;
  }

  async function mintAndUnlock(closedId, keyId, doorOption) {
    const connected = await initAddress();
    //const { numToMint } = mintForm;
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "homestead") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return 0;
    }
    const contract = new ethers.Contract(
      contractAddrClosed,
      DimensionDoors.output.abi,
      provider.getSigner()
    );

    // The price id of the door is offset 4 from the price id of the key
    // So we don't need to determine the door class because we already know the key class
    const _price = prices[keyId] + prices[keyId + 4]
    const converter = ethers.BigNumber.from("1000000000000000");
    const priceFinney = ethers.BigNumber.from(`${_price * 1000}`);
    const price = ethers.utils.formatUnits(`${priceFinney.mul(converter)}`, "wei");

    try {
      const token = await contract.purchaseAndUnlock(Number(closedId), Number(keyId), Number(doorOption), { value: price });
      await token.wait();
    } catch (error) {
      setErrorMsg(error.message);
      console.log(error.message);
      return 0;
    }
    closedUpdateFuncs[closedId]("supply", 1);
    closedUpdateFuncs[keyId]("supply", 1);
    return 1;
  }
  
  async function mintBulkButton() {
    var tokenIds = [];
    var amounts = [];
    for (const [key, value] of Object.entries(selectedClosedTokens)) {
        if (value == null || value == 0) {
          continue;
        }

        tokenIds.push(key);
        amounts.push(value);
    }

    await mintBulk(tokenIds, amounts);
  }

  async function mintBulk(tokenIds, amounts) {
    const connected = await initAddress();
    //const { numToMint } = mintForm;
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "homestead") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return 0;
    }
    const contract = new ethers.Contract(
      contractAddrClosed,
      DimensionDoors.output.abi,
      provider.getSigner()
    );


    const converter = ethers.BigNumber.from("1000000000000000");
    // selectedTokensPrice is already * 1000
    const priceFinney = ethers.BigNumber.from(`${selectedTokensPrice}`);
    const price = ethers.utils.formatUnits(`${priceFinney.mul(converter)}`, "wei");
    try {
      const token = await contract.mint(tokenIds, amounts, { value: price });
      await token.wait();
    } catch (error) {
      setErrorMsg(error.message);
      console.log(error.message);
      return 0;
    }

    for (let i = 0; i < tokenIds.length; i++) {
      closedUpdateFuncs[tokenIds[i]]("supply", amounts[i]);
      closedUpdateFuncs[tokenIds[i]]("owned", amounts[i]);
    }

    return 1;
  }
  
  async function mintSingle(tokenId, _price) {
    const connected = await initAddress();
    //const { numToMint } = mintForm;
    const provider = await getProvider();
    const { name } = await provider.getNetwork();
    if (name !== "homestead") {
      setErrorMsg(`You are on the wrong network: ${name}`);
      return 0;
    }
    const contract = new ethers.Contract(
      contractAddrClosed,
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
      return 0;
    }
    return 1;
  }


  console.log("Building batch provenance hashes..")

  var closedBatchHashes = Array(currentBatch);
  var openBatchHashes = Array(currentBatch);

  for (let i = 0; i < currentBatch; i++) {
      closedBatchHashes[i] = closedMeta[4 + i * 10].provenance_batch;
      openBatchHashes[i] = openMeta[i * 60].provenance_batch;
  }

  const concatenatedClosedProvenance = closedBatchHashes.join('');
  const concatenatedOpenProvenance = openBatchHashes.join('');

  /*
                    <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[5 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[5 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[5 + (currentBatch - 1) * 60]}  _opened={true} _openSea={false} _collapsed={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[6 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[6 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[6 + (currentBatch - 1) * 60]}  _opened={true} _openSea={false}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[7 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[7 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[7 + (currentBatch - 1) * 60]}  _opened={true} _openSea={false} _collapsed={true}/>                
*/

/*
        <div className="md:flex justify-center items-center space-x-16 mb-5 md:mr-0 mr-10">
          <div className="md:flex justify-center items-center pl-4 pr-4 md:pl-12 md:pr-12 xl:pl-128 xl:pr-128">
            <div className="styles_container__16cxk">
              <video className="rounded-2xl styles_video__32uJf" alt="EXAMPLE" playsInline={true} loop={true} controls={false} src="https://ipfs.io/ipfs/bafybeiafp2swhktchn3mnxxell5pqnnd4qvztgylz5za6ohixm56m3ed5y/Example.mp4" autoPlay={true} muted={true}> </video>
            </div>
          </div>
        </div>
*/
  console.log("Building page..")
  return (
    <div id="home" className="main justify-center items-center">
      
      <Header title="Dimension Doors NFTs"/>
      <NextSeo
        title="Dimension Doors NFTs"
        description="Dimension Doors is a collection of 3504 NFTs—unique digital collectibles living on the Ethereum blockchain. This collection consists of 4 keys, 500 closed doors and 3000 open doors. Each closed door can have different quantities based on its class: S, A, B or C. Respectively consisting of 1, 2, 5, 10 quantities per closed door. Once you own a closed door and key of that class, you can unlock that specific door and choose an 1/1 opened door NFT. Unlocking an open door will burn the closed door and key, and mint the open door of your choosing. Because each closed Dimension Door is hand-drawn, it will take time to finish the whole collection. That's why drops will happen in 50 batches consisting of the same ratios and quantities per class."
      />
      <NavBar connectWalletFunc={initAddress} mintBulk={mintBulkButton} mintBulkInit={initNavBarBulkMintFunc}/>

      <div className="wrapper">
        <div className="md:flex justify-center items-center space-x-16 mt-5 md:mr-0 mr-10">
          <div className="md:flex justify-center items-center pl-4 pr-4 md:pl-12 md:pr-12 xl:pl-128 xl:pr-128">
            <div className="styles_container__16cxk">
              <video className="rounded-2xl styles_video__32uJf" alt="TRANSITION" playsInline={true} loop={true} controls={false} src="https://ipfs.io/ipfs/bafybeiafp2swhktchn3mnxxell5pqnnd4qvztgylz5za6ohixm56m3ed5y/Example.mp4" autoPlay={true} muted={true}> </video>
            </div>
          </div>
        </div>

        <div className="md:flex space-x-16 mt-5 md:mr-0 mr-10 pl-2 pr-2 md:pl-10 md:pr-10 xl:pl-80 xl:pr-80">
            <div className="md:flex items-center">
              <div className="">
                <h1 className="text-3xl text-textColor font-medium leading-snug tracking-wider">DIMENSION DOORS</h1>
                <p className="text-mainColor mt-4 text-lg font-normal ">Dimension Doors is a collection of 3504 NFTs—unique digital collectibles living on the Ethereum blockchain. This collection consists of 4 keys, 500 closed doors and 3000 open doors. Each closed door can have different quantities based on its class: S, A, B or C. Respectively consisting of 1, 2, 5, 10 quantities per closed door. Once you own a closed door and  key of that class, you can unlock that specific door and choose an 1/1 opened door NFT. Unlocking an open door will burn the closed door and key, and mint the open door of your choosing. Because each closed Dimension Door is hand-drawn, it will take time to finish the whole collection. That's why drops will happen in 50 batches consisting of the same ratios and quantities per class. </p><br></br>
                  
              </div>
            </div>
            <div className="max-w-lg pr-24 pb-8 md:flex justify-center items-center hidden">
              <img className="rounded-lg" alt="INTROIMAGE" width={1500} src={introImage}/>
            </div>
          </div>
        </div>

        <div id="mint" className="px-1 justify-center items-center"><div className="divider-top"></div></div>

        <div className="md:flex space-x-16 mt-5 justify-center">
          <div className="md:flex items-center">
            <div>
              <h1 className="text-5xl text-textColor font-medium leading-snug tracking-wider text-center">MINT</h1>
            </div>
          </div>
        </div>

        <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
            <div className="md:px-10 sm:px-1">

            <div className="relative flex flex-row justify-center align-top justify-top items-center panel-darken md:px-60">
              {randomOpenPanels}
                </div>

            </div>
        </div>


        <div id="gallery" className="px-1 justify-center items-center"><div className="divider-top"></div></div>
        <h1 className="text-center text-5xl text-textColor font-medium leading-snug tracking-wider pt-6">
                GALLERY
        </h1>
        <p className="text-center text-lg text-textColor mt-2 px-6">
                You can buy closed doors, and unlock them using the right key. There are multiple classes just like the keys.
            </p>
      
        <div className="max-w-full mx-auto py-8 px-6">
            <h1 className="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                KEYS
            </h1>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Keys are used to unlock doors, if you don't have the right key for the class, you can't use it.
            </p>
            <div className="h-1 mx-auto bg-indigo-200 w-24 opacity-75 mt-4 rounded"></div>

            <div className="max-w-full mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[0]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[0]} _supply={currentClosedSupplies[0]} _useVideo={false}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[1]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[1]} _supply={currentClosedSupplies[1]} _useVideo={false}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[2]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[2]} _supply={currentClosedSupplies[2]} _useVideo={false}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[3]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[3]} _supply={currentClosedSupplies[3]} _useVideo={false}/>
                </div>
            </div>
        </div>
        <div className="px-1 justify-center items-center"><div className="divider-top"></div></div>

      <div className="hidden sm:block">

        <div className="max-w-full mx-auto py-8 px-6">
            <h1 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                CLOSED DOORS
            </h1>

            <h2 className="text-center text-4xl  text-textColor mt-12 font-medium leading-snug tracking-wider">
                S-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains only 1 S-class door with a quantity of 1.
            </p>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[4 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[4 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[4 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor pr-80">
                      <div className="relative flex flex-col md:flex-row justify-center items-center pr-80">
                      <div className="flex flex-row pr-60">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[(currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[(currentBatch - 1) * 60]} _supply={currentOpenSupplies[(currentBatch - 1) * 60]} _opened={true} _width={500}/>
                      </div>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-full mx-auto px-6 pt-6">
          <h2 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                A-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 2 A-class doors with a quantity of 2 each, making a total of 4.
            </p>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[5 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[5 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[5 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor pr-80">
                      <div className="relative flex flex-col md:flex-row justify-center items-center pr-80">
                      <div className="flex flex-row pr-60">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[1 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[1 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[1 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[2 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[2 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[2 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>

                        </div>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[6 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[6 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[6 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor pr-80">
                      <div className="relative flex md:flex-row justify-center items-center pr-80">
                        <div className="flex flex-row pr-60">
                          <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[3 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[3 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[3 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                          <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[4 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[4 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[4 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        </div>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-full mx-auto px-6 pt-6">
          <h2 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                B-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 3 B-class doors with a quantity of 5 each, making a total of 15.
            </p>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[7 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[7 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[7 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[5 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[5 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[5 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[6 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[6 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[6 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[7 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[7 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[7 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[8 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[8 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[8 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[9 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[9 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[9 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[8 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[8 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[8 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[10 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[10 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[10 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[11 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[11 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[11 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[12 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[12 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[12 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[13 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[13 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[13 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[14 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[14 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[14 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[9 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[9 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[9 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[15 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[15 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[15 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[16 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[16 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[16 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[17 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[17 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[17 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[18 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[18 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[18 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[19 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[19 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[19 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="max-w-full mx-auto px-6 pt-6">
          <h2 className="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                C-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains 4 C-class doors with a quantity of 10 each, making a total of 40.
            </p>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[10 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[10 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[10 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[20 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[20 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[20 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[21 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[21 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[21 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[22 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[22 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[22 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[23 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[23 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[23 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[24 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[24 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[24 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[25 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[25 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[25 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[26 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[26 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[26 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[27 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[27 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[27 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[28 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[28 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[28 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[29 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[29 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[29 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[11 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[11 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[11 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[30 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[30 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[30 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[31 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[31 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[31 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[32 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[32 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[32 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[33 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[33 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[33 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[34 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[34 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[34 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[35 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[35 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[35 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[36 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[36 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[36 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[37 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[37 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[37 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[38 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[38 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[38 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[39 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[39 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[39 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[12 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[12 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[12 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[40 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[40 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[40 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[41 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[41 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[41 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[42 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[42 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[42 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[43 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[43 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[43 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[44 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[44 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[44 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[45 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[45 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[45 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[46 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[46 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[46 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[47 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[47 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[47 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[48 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[48 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[48 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[49 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[49 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[49 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full mx-auto flex justify-center">
          <div className="bg-mainColor shadow-md rounded">
            <table className="text-left w-full border-collapse">       
              <tbody>
                <tr className="hover:bg-grey-lighter">
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[13 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[13 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[13 + (currentBatch - 1) * 10]} _width={500}/>
                    </td>
                    <td className="py-4 px-6 border-b border-grey-light text-textColor">
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[50 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[50 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[50 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[51 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[51 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[51 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[52 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[52 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[52 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[53 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[53 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[53 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[54 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[54 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[54 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                      <div className="relative flex flex-col md:flex-row justify-center items-center">
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[55 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[55 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[55 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[56 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[56 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[56 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[57 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[57 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[57 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[58 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[58 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[58 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                        <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[59 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[59 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[59 + (currentBatch - 1) * 60]}  _opened={true} _collapsed={true} _width={400}/>
                      </div>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div className="sm:hidden column">
        <div className="max-w-full mx-auto py-8 px-6">
            <h1 className="text-center text-4xl  text-textColor font-medium leading-snug tracking-wider">
                CLOSED DOORS
            </h1>

            <h2 className="text-center text-4xl  text-textColor mt-12 font-medium leading-snug tracking-wider">
                S-class
            </h2>
            <p className="text-center text-lg text-textColor mt-2 px-6">
                Each batch contains only 1 S-class door with a quantity of 1.
            </p>
            <div className="h-1 mx-auto bg-indigo-200 w-12 opacity-75 mt-4 rounded"></div>

            <div className="max-w-full md:max-w-5xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[4 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[4 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[4 + (currentBatch - 1) * 10]} _useVideo={false}/>    
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
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[5 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[5 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[5 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[6 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[6 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[6 + (currentBatch - 1) * 10]}/>
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
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[7 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[7 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[7 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[8 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[8 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[8 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[9 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[9 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[9 + (currentBatch - 1) * 10]}/>
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
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[10 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[10 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[10 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[11 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[11 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[11 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[12 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[12 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[12 + (currentBatch - 1) * 10]}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerClosedSupplies[13 + (currentBatch - 1) * 10]} _updateFunc={updateClosedPanel} _updateFuncAsync={updateClosedPanelAsync} meta={closedMeta[13 + (currentBatch - 1) * 10]} _supply={currentClosedSupplies[13 + (currentBatch - 1) * 10]}/>
                </div>
            </div>
        </div>

        <div id="unlock" className="px-1 justify-center items-center"><div className="divider-top"></div></div>
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
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[(currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[(currentBatch - 1) * 60]} _supply={currentOpenSupplies[(currentBatch - 1) * 60]}  _opened={true} _useVideo={false}/>   
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
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[1 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[1 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[1 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[2 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[2 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[2 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[3 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[3 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[3 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[4 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[4 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[4 + (currentBatch - 1) * 60]}  _opened={true}/>
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
            <div className="max-w-full md:max-w-7xl mx-auto my-3 md:px-8">
              <div className="relative flex flex-col md:flex-row justify-center items-center">
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[5 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[5 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[5 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[6 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[6 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[6 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[7 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[7 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[7 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[8 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[8 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[8 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[9 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[9 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[9 + (currentBatch - 1) * 60]}  _opened={true}/>
              </div>
              <div className="relative flex flex-col md:flex-row justify-center items-center">
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[10 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[10 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[10 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[11 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[11 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[11 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[12 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[12 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[12 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[13 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[13 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[13 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[14 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[14 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[14 + (currentBatch - 1) * 60]}  _opened={true}/>
              </div>
              <div className="relative flex flex-col md:flex-row justify-center items-center">
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[15 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[15 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[15 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[16 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[16 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[16 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[17 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[17 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[17 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[18 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[18 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[18 + (currentBatch - 1) * 60]}  _opened={true}/>
                <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[19 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[19 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[19 + (currentBatch - 1) * 60]}  _opened={true}/>
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
            <div className="max-w-full md:max-w-7xl mx-auto my-3 md:px-8">
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[20 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[20 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[20 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[21 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[21 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[21 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[22 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[22 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[22 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[23 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[23 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[23 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[24 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[24 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[24 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[25 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[25 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[25 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[26 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[26 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[26 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[27 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[27 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[27 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[28 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[28 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[28 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[29 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[29 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[29 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[30 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[30 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[30 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[31 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[31 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[31 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[32 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[32 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[32 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[33 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[33 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[33 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[34 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[34 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[34 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[35 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[35 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[35 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[36 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[36 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[36 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[37 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[37 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[37 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[38 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[38 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[38 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[39 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[39 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[39 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[40 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[40 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[40 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[41 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[41 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[41 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[42 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[42 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[42 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[43 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[43 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[43 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[44 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[44 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[44 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[45 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[45 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[45 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[46 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[46 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[46 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[47 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[47 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[47 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[48 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[48 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[48 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[49 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[49 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[49 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[50 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[50 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[50 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[51 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[51 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[51 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[52 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[52 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[52 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[53 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[53 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[53 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[54 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[54 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[54 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
                <div className="relative flex flex-col md:flex-row justify-center items-center">
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[55 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[55 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[55 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[56 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[56 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[56 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[57 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[57 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[57 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[58 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[58 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[58 + (currentBatch - 1) * 60]}  _opened={true}/>
                  <DoorPanel _prices={prices} _connectedAddress={connectedAddress} _owned={ownerOpenedSupplies[59 + (currentBatch - 1) * 60]} _updateFunc={updateOpenPanel} _updateFuncAsync={updateOpenPanelAsync} meta={openMeta[59 + (currentBatch - 1) * 60]} _supply={currentOpenSupplies[59 + (currentBatch - 1) * 60]}  _opened={true}/>
                </div>
            </div>
        </div>
      </div>

      
      
      <div id="provenance" className="px-1 justify-center items-center"><div className="divider-top"></div></div>

      <div className="md:flex space-x-16 mt-5 justify-center">
          <div className="md:flex items-center">
            <div>
              <h1 className="text-5xl text-textColor font-medium leading-snug tracking-wider text-center">PROVENANCE</h1>
              <p className="text-left text-lg text-textColor mt-2 px-6 md:px-80 sm:px-1">
                Provenance hashes are a means to validate the authenticity of an NFT post-mint. Because the NFTs will be dropped in 50 batches, each batch will get a provenance hash of all the NFTs of that batch. There will be 2 sets of provenance hashes, 1 for keys + closed doors and 1 for opened doors. Provenance hashes will be done per batch, so the first batch will have a provenance hash of the NFTs inside that batch. The second will also have a provenance hash, and from there a master provenance hash will be made from those 2 hashes. This will repeat until we have a master provenance hash of of all batches combined. All batch provenance hashes will be stored in the blockchain, the batch-specific and NFT-specific provenance hashes are also available in the metadata. The master provenance hash will be updated before each batch drop, which is a hash of all previous batch hashes. The first closed doors provenance hash batch will also contain the keys.
              </p>
              <p className="text-center text-lg font-bold text-textColor mt-2 px-6">
                Current master provenance hash for keys + closed doors
              </p>
              <div className="flex justify-center items-center pt-2">
                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={10} cols={100} disabled={true} value={masterClosedProvenance}/>
              </div>

              <p className="text-center text-lg font-bold text-textColor mt-2 px-6">
                Concatenated master hash
              </p>

              <div className="flex justify-center items-center pt-2">
                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={10} cols={100} disabled={true} value={concatenatedClosedProvenance}/>
              </div>

              <p className="text-center text-lg font-bold text-textColor mt-2 px-6">
                Current master provenance hash for opened doors
              </p>

              <div className="flex justify-center items-center pt-2">
                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={10} cols={100} disabled={true} value={masterOpenProvenance}/>
              </div>

              <p className="text-center text-lg font-bold text-textColor mt-2 px-6">
                Concatenated master hash
              </p>

              <div className="flex justify-center items-center pt-2">
                <textarea className="textarea bg-backgroundColor text-textColor border border-textColor px-1 py-1" rows={10} cols={100} disabled={true} value={concatenatedOpenProvenance}/>
              </div>
              <h2 className="text-center text-4xl text-textColor font-medium leading-snug tracking-wider mt-16">
                KEYS AND CLOSED DOORS
              </h2>
              <p className="text-center text-lg text-textColor mt-2 px-6">
                The first set of provenance hashes is for keys and closed doors. Below you'll find the provenance hash for each batch and the hash for each unique NFT.
              </p>
              
              <ProvenanceTable _metas={closedMeta} _batch={true} _batchHashes={closedBatchHashes} _closed={true}/>
              <ProvenanceTable _metas={closedMeta} _batchHashes={closedBatchHashes}/>

              <h2 className="text-center text-4xl text-textColor font-medium leading-snug tracking-wider">
                OPEN DOORS
              </h2>
              <p className="text-center text-lg text-textColor mt-2 px-6">
                Just like the closed doors and keys, open doors have their own set of provenance hashes, due to these being on another Smart Contract to make them 1/1 NFTs.
              </p>

              <ProvenanceTable _metas={closedMeta} _batch={true} _batchHashes={openBatchHashes}/>
              <ProvenanceTable _metas={openMeta} _batchHashes={closedBatchHashes}/>
            </div>
          </div>
      </div>

      <div id="roadmap" className="px-1 justify-center items-center"><div className="divider-top"></div></div>

      <div className="md:flex space-x-16 mt-5 justify-center">
          <div className="md:flex items-center">
            <div>
              <h1 className="text-5xl text-textColor font-medium leading-snug tracking-wider text-center">ROADMAP</h1>

              <p className="text-left text-lg text-textColor mt-2 px-6 md:px-80 sm:px-1 pb-8">
                  The final goal is to have 50 batches of closed + open doors. Each batch containing 10 closed doors and 60 open doors, and maintaining the rarity ratio that is pre-established. we're currently at batch {currentBatch}.
                  Because the closed door NFTs are hand-made, it will take a while before all NFTs are finished. That's why the batch system is made and more batches will come in the following months and years.
              </p>

              <div className="w-full mx-auto flex justify-center">
                <div className="bg-mainColor shadow-md rounded">
                  <table className="text-left w-full border-collapse">
                    <thead>
                          <tr> 
                              <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">SOLD 75%</th>
                              <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-textColor border-b border-grey-light">GOAL</th>
                          </tr>

                    </thead>
                    <tbody>
                      <tr className="hover:bg-grey-lighter">
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Batch 5</td>
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Make up to batch 15</td>
                      </tr>
                      <tr className="hover:bg-grey-lighter">
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Batch 10</td>
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Make up to batch 25</td>
                      </tr>
                      <tr className="hover:bg-grey-lighter">
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Batch 20</td>
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Make up to batch 30</td>
                      </tr>
                      <tr className="hover:bg-grey-lighter">
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Batch 30</td>
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Make up to batch 40</td>
                      </tr>
                      <tr className="hover:bg-grey-lighter">
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Batch 40</td>
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Make up to batch 50</td>
                      </tr>
                      <tr className="hover:bg-grey-lighter">
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Batch 50</td>
                        <td className="py-4 px-6 border-b border-grey-light text-textColor">Project finished</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
      </div>

      <div id="team" className="px-1 justify-center items-center"><div className="divider-top"></div></div>

      <div className="md:flex space-x-16 mt-5 justify-center">
          <div className="md:flex items-center">
            <div>
              <h1 className="text-5xl text-textColor font-medium leading-snug tracking-wider text-center">TEAM</h1>
              <p className="text-mainColor mt-4 text-lg font-normal">The team consists of one person, Moot. I've made the art, smart contract, and the website. You can find my socials at the top or bottom. </p><br></br>
                
            </div>
          </div>
      </div>


      <Footer/>
    </div>
  )
}

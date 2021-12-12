import React from 'react'
import ReactTooltip from 'react-tooltip';
import { useState } from 'react';
import { ethers } from "ethers";

import { contractAddrClosed, contractAddrOpened, keyIds, doorPriceIds, quantities, supplies } from "../config";

const DoorPanel = ({_prices, _connectedAddress, _owned, _updateFunc, _updateFuncAsync, meta, _supply, _opened, _useVideo, _queued}) => {

    const converter = ethers.BigNumber.from("1000000000000000");
    const currentBatch = 1;

    var connectedAddress = _connectedAddress;

    const [queued, setQueued] = useState(_queued);
    const [opened, setOpened] = useState(_opened);
    const [useVideo, setUseVideo] = useState(_useVideo);
    const [connectedState, setConnectedState] = useState([connectedAddress != "", _owned, _connectedAddress]);

    const borderColors = {"S" : "border-classS", "A" : "border-classA", "B" : "border-classB", "C" : "border-classC"}

    //console.log(meta);
    const name = meta.name;
    const image = meta.image;
    const tokenId = meta.token_id;
    const doorClass = meta.attributes[1].value;
    var closedId = -1;
    var doorOption = -1;

    var _price = 1;
    if (tokenId < 4) {
        _price = _prices[keyIds[doorClass]];
    }
    else {
        _price = _prices[doorPriceIds[doorClass]];
    }
    const [price, setPrice] = useState(_price);

    var _canMintAndUnlock = false;
    var maxQuantity = 1;
    if (_opened) {
        closedId = meta.closed_id;
        doorOption = meta.attributes[3].value - 1;
        _updateFunc("init", tokenId, keyIds[doorClass], doorOption, updatePanel);

        var closedSupply = _updateFunc("closedSupply", closedId, keyIds[doorClass], doorOption, updatePanel);
        var keySupply =  _updateFunc("keySupply", closedId, keyIds[doorClass], doorOption, updatePanel);

        const doorMaxQuantity = quantities[doorClass]
        const keyMaxQuantity = quantities[doorClass] * supplies[doorClass] * currentBatch

        closedSupply = doorMaxQuantity - closedSupply;
        keySupply = keyMaxQuantity - keySupply;
        //console.log("closed supply", closedSupply);
        //console.log("key supply", keySupply);
        _canMintAndUnlock = (closedSupply > 0 && keySupply > 0);

    } else if(!_queued) {
        _updateFunc("init", tokenId, price, updatePanel);
    }

    const [canMintAndUnlock, setCanMintAndUnlock] = useState(_canMintAndUnlock);

    if (!_opened) {
        if (tokenId < 4) {
            maxQuantity = quantities[doorClass] * supplies[doorClass] * currentBatch
        }
        else {
            maxQuantity = quantities[doorClass]
        }
    }

    const [supply, setSupply] = useState(maxQuantity - _supply);
    const [selectedSupply, setSelectedSupply] = useState(0);
    /*var ownedSupply = _owned;

    if (connected && !queued) {

        if (opened) {
            ownedSupply = 0;
            //ownedSupply = _updateFunc("ownedSupply", tokenId, keyIds[doorClass], doorOption, updatePanel);
        } else {
            console.log(name);
            ownedSupply = _updateFunc("ownedSupply", tokenId, price, updatePanel);
        }
        //console.log(ownedSupply);
    }

    const [owned, setOwned] = useState(ownedSupply);*/

    var AnimationUrl = "";
    if (_useVideo) {
        AnimationUrl = meta.animation_url;
    }
    else {
        AnimationUrl = meta.image_url;
    }

    function arrayRemove(arr, value) { 
        return arr.filter(function(ele){ 
            return ele != value; 
        });
    }

    function updatePanel(arg, value) {
        if (arg == "supply") {
            setSupply(supply - value);
            return;
        }
        if (arg == "connect") {
            connectedAddress = value[2];
            //console.log(name);
            setConnectedState(value);
            return;
        }
        if (arg == "owned") {
            //console.log(name);
            setConnectedState([connectedState[0], connectedState[1] + value, connectedState[2]]);
            return;
        }
    }

    function viewOS() {
        var url = "https://opensea.io/assets/";
        if (opened) {
            url = url + contractAddrOpened + "/" + tokenId.toString();
        }
        else {
            url = url + contractAddrClosed + "/" + tokenId.toString();
        }
        window.open(url, '_blank').focus();
    }

    function openImage() {
        window.open(image, '_blank').focus();
    }

    async function mint() {
        const dSupply = await _updateFuncAsync("mint", tokenId, _price);
        setSupply(supply - dSupply);
        setConnectedState([connectedState[0], connectedState[1] + dSupply, connectedState[2]]);
    }

    function mintAdd() {
        if (selectedSupply < supply) {
            const dSelection = _updateFunc("add", tokenId, _price);
            console.log(dSelection);
            setSelectedSupply(selectedSupply + dSelection);

            console.log("Added: ", tokenId, " - ", selectedSupply);
        }
    }

    function mintRemove() {
    if (selectedSupply > 0) {
        const dSelection = _updateFunc("remove", tokenId, _price);
        console.log(dSelection);
        setSelectedSupply(selectedSupply - dSelection);
        console.log("Removed: ", tokenId, " - ", selectedSupply);
        }
    }

    async function mintAndUnlock() {
        if (canMintAndUnlock) {
            const dSupply = await _updateFuncAsync("mintUnlock", closedId, keyIds[doorClass], doorOption);
            setSupply(supply - dSupply);
        }
    }

    async function unlockDoor() {
        const dSupply = await _updateFuncAsync("unlock", closedId, keyIds[doorClass], doorOption);
        setSupply(supply - dSupply);
        setConnectedState([connectedState[0], connectedState[1] - dSupply, connectedState[2]]);
    }

    async function unlockAdd() {

    }

    async function unlockRemove() {

    }

    return (

    <div className={"max-w-full items-center justify-center w-3/8 relative rounded-2xl shadow-lg sm:my-5 my-8  md:mr-2 ml-2 border-8 " + ((selectedSupply > 0) ? ("border-gold") : ("border-gray-200"))}>
        <div className="bg-white text-gray rounded-lg shadow-lg overflow-hidden items-center justify-center">
            <div className="block text-left text-sm sm:text-md max-w-sm mx-auto mt-2 text-black px-8 lg:px-6">
                <h1 className="text-lg font-medium uppercase p-3 pb-0 text-center tracking-wide">
                    {name} 
                </h1>

                
            </div>

            <button className="items-center justify-center flex flex-wrap mt-2 px-6 pb-6 " onClick={openImage}>
                <ul>
                    {useVideo ? (
                         <video src={AnimationUrl} playsInline={true} loop={true} controls={false} autoPlay={true} muted={true} className="rounded-xl items-center justify-center w-full object-center border-4 border-gray-200"></video>
                    ) : (
                        <img src={image} alt="" className="rounded-xl items-center justify-center w-full object-center border-2 border-gray-200"></img>
                    ) }
                   
                    
                    
                </ul> 
            </button>  

            
            {(opened || queued) ? (<div></div>) : (
                        <div>

                            <h2 className="text-lg font-bold text-gray-700 text-center uppercase">SUPPLY {supply} / {maxQuantity}</h2>
                            {connectedState[0] ? (
                                <h2 className="text-lg font-bold text-gray-700 text-center uppercase">OWNED {connectedState[1]} / {maxQuantity}</h2>
                            ) : (
                                <h2/>
                            )}
                            <h2 className=" flex text-2xl font-bold text-gray-700 items-center justify-center text-center py-1 uppercase">
                                <img src="/eth.svg" alt="ETH" className="logo"/> {price}
                            </h2>     

                            {(selectedSupply > 0) ? (
                            <h2 className="text-lg font-bold text-gold text-center uppercase">SELECTED {selectedSupply}</h2>
                            ) : (
                            <h2 className="text-lg font-bold text-white text-center uppercase">{0}</h2>
                            )}          
                        </div>  
            )}

            
            
            {opened ? (
                (supply > 0) ? (
                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                onClick={unlockDoor} data-tip data-for="unlockTip">
                                UNLOCK
                            </button>

                            <ReactTooltip id="unlockTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                Unlock this door if you own the right door and key.
                            </ReactTooltip>
                        </div>
                        {(canMintAndUnlock) ? (                       
                            <div className="flex items-center px-8">
                                <button className="mt-3 text-lg font-semibold bg-green-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={mintAndUnlock} data-tip data-for="mintAndUnlockTip">
                                    MINT AND UNLOCK
                                </button>

                                <ReactTooltip id="mintAndUnlockTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Mint the needed door and key to unlock this door and unlock it afterward.
                                </ReactTooltip>
                            </div>
                        ) : (                       
                            <div className="flex items-center px-8">
                                <button className="mt-3 text-lg font-semibold bg-red-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    data-tip data-for="mintAndUnlockUnavailableTip">
                                    NOT AVAILABLE
                                </button>

                                <ReactTooltip id="mintAndUnlockUnavailableTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Not enough doors or keys to mint and unlock.
                                </ReactTooltip>
                            </div>
                        )}
 
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-lightBlue-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                            data-tip data-for="openseaTip">
                                VIEW ON OPENSEA
                            </button>


                            <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                            </ReactTooltip>
                        </div>
                    </div>
                ) : (
                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-red-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                data-tip data-for="unlockedTip">
                                UNLOCKED
                            </button>

                            <ReactTooltip id="unlockedTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Door is already unlocked.
                            </ReactTooltip>
                        </div>
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-red-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    data-tip data-for="unlockedTip">
                                NOT AVAILABLE
                            </button>

                            <ReactTooltip id="unlockedTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Door is already unlocked.
                            </ReactTooltip>
                        </div>
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={viewOS} data-tip data-for="openseaTip">
                                VIEW ON OPENSEA
                            </button>

                            <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                            </ReactTooltip>
                        </div>
                    </div>

                )
            ) : (

                (supply > 0 ? (

                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-red-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                onClick={mintRemove}  data-tip data-for="removeTip">
                                REMOVE
                            </button>

                            <ReactTooltip id="removeTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Remove this NFT from the mint list.
                            </ReactTooltip>
                        </div>
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-green-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                onClick={mintAdd} data-tip data-for="addTip">
                                ADD
                            </button>

                            <ReactTooltip id="addTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Add this NFT to the mint list.
                            </ReactTooltip>
                        </div>
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={mint} data-tip data-for="mintTip">
                                MINT
                            </button>

                            <ReactTooltip id="mintTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Mint this NFT right away.
                            </ReactTooltip>
                        </div>

                        {(supply == maxQuantity ? (                        
                        
                            <div className="flex items-center px-8">
                                <button className="mt-3 text-lg font-semibold bg-lightBlue-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                 data-tip data-for="openseaTip">
                                    VIEW ON OPENSEA
                                </button>

                                <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                                </ReactTooltip>
                            </div>
                        ) : (
                            <div className="flex items-center px-8">
                                <button className="mt-3 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                        onClick={viewOS} data-tip data-for="openseaTip">
                                    VIEW ON OPENSEA
                                </button>

                                <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                                </ReactTooltip>
                            </div>
                        ))}

                    </div>


                ) : (

                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-red-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl"
                             data-tip data-for="soldoutTip">
                                SOLD OUT
                            </button>
                        </div>
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-green-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl"
                             data-tip data-for="soldoutTip">
                                SOLD OUT
                            </button>
                        </div>
                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-blue-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl"
                            data-tip data-for="soldoutTip">
                                SOLD OUT
                            </button>
                        </div>

                        <ReactTooltip id="soldoutTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                This door is sold out.
                        </ReactTooltip>

                        <div className="flex items-center px-8">
                            <button className="mt-3 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={viewOS} data-tip data-for="openseaTip">
                                VIEW ON OPENSEA
                            </button>

                            <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                View this NFT on OpenSea.
                            </ReactTooltip>
                        </div>
                    </div>

                ))

            ) }



        </div>
    </div>

    )
}

export default DoorPanel
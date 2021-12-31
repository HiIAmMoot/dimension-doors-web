import React from 'react'
import ReactTooltip from 'react-tooltip';
import { useState } from 'react';
import { ethers } from "ethers";

import { contractAddrClosed, contractAddrOpened, keyIds, doorPriceIds, quantities, supplies } from "../config";

const DoorPanel = ({_prices, _connectedAddress, _owned, _updateFunc, _updateFuncAsync, meta, _supply, _opened, _useVideo, _queued, _collapsed, _swappable, _fadeMeta, _width = 0}) => {

    const converter = ethers.BigNumber.from("1000000000000000");
    const currentBatch = 1;

    var connectedAddress = _connectedAddress;

    const [swappable, setSwappable] = useState(_swappable);
    const [collapsed, setCollapsed] = useState(_collapsed);
    const [width, setWidth] = useState(_width);
    const [queued, setQueued] = useState(_queued);
    const [opened, setOpened] = useState(_opened);
    const [useVideo, setUseVideo] = useState(_useVideo);
    const [connectedState, setConnectedState] = useState([connectedAddress != "", _owned, _connectedAddress]);

    const borderColors = {"S" : "border-classS", "A" : "border-classA", "B" : "border-classB", "C" : "border-classC"}

    //console.log(meta);
    var name = meta.name.replace(" - Opened", "");
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

    function swap() {
        _updateFunc("swap", tokenId, doorClass, doorOption);
    }

    return (

    <div className={"max-w-full vertical-align-top items-center justify-center align-top w-3/8 relative rounded-2xl shadow-lg sm:my-1 my-2  md:mr-2 ml-2 border-8 " + ((selectedSupply > 0) ? ("border-gold") : ("border-gray-200"))}>
        <div className="bg-white text-gray rounded-lg shadow-lg overflow-hidden items-center justify-center">

            {collapsed ? (                            
                        <div className="block text-left text-sm sm:text-md max-w-sm mx-auto mt-1 text-black px-4 lg:px-3">
                            <h1 className="text-lg font-medium uppercase pt-2 px-0 pb-0 text-center tracking-wide">
                                {name} 
                            </h1>
                        </div>) : (
                            <div className="block text-left text-sm sm:text-md max-w-sm mx-auto mt-1 text-black px-8 lg:px-6">
                            <h1 className="text-lg font-medium uppercase p-2 pb-0 text-center tracking-wide">
                                {name} 
                            </h1>
                        </div>
            )}


            <button className="items-center justify-center flex flex-wrap mt-1 px-6 pb-2" onClick={openImage}>
                <ul>
                    {useVideo ? (
                         <video src={AnimationUrl} alt="DOOR IMAGE" playsInline={true} loop={true} controls={false} autoPlay={true} muted={true} className="rounded-xl items-center justify-center w-full object-center border-4 border-gray-200"></video>
                    ) : ((width > 0) ? 
                        
                        (
                            
                        <img src={image} alt="DOOR IMAGE" width={_width} className="rounded-xl flex items-center justify-center object-center border-2 border-gray-200"></img>
                        ) : 
                        (
                         <img src={image} alt="DOOR IMAGE" className="rounded-xl flex items-center justify-center object-center border-2 border-gray-200"></img>
                        )
                    )}
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

            
            {collapsed && swappable? (  

                    <div className="row justify-center items-center pb-8">
                    <div className="flex items-center px-8">
                        <button className="mt-3 text-lg font-semibold bg-green-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                            onClick={swap} data-tip data-for="swapTip">
                            SWAP
                        </button>

                        <ReactTooltip id="swapTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                            SWAP THIS DOOR WITH ANOTHER
                        </ReactTooltip>
                    </div>

                    <div className="flex items-center px-8">
                    <button className="flex mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 justify-center items-center shadow-xl hover:bg-gray-700"
                                    onClick={mintAndUnlock} data-tip data-for="mintAndUnlockTip">
                                    MINT FOR <img src="/eth.svg" alt="ETH" className="logo"/> {_prices[keyIds[doorClass]] + _prices[keyIds[doorClass] + 4]}
                                </button>

                                <ReactTooltip id="mintAndUnlockTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Mint the needed door and key to unlock this door and unlock it afterward.
                                </ReactTooltip>
                            </div>
                </div>

) : 
            
            (opened ? (
                (supply > 0) ? (
                    <div className="flex justify-center items-center pt-2">
                        <div className="flex items-center">
                            <button className="flex mx-1 mb-5 ml-2 text-lg font-semibold bg-green-700 w-full text-white rounded-lg p-2 justify-center items-center shadow-xl hover:bg-gray-700"
                                onClick={unlockDoor} data-tip data-for="unlockTip">
                                <img src="/panel/unlock.png" alt="UNLOCK" className="logo-big2"/>
                            </button>

                            <ReactTooltip id="unlockTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                Unlock this door if you own the right door and key.
                            </ReactTooltip>
                        </div>
                        {(canMintAndUnlock) ? (                       
                            <div className="flex items-center">
                                <button className="flex mx-1 mb-5 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg p-2 justify-center items-center shadow-xl hover:bg-gray-700"
                                    onClick={mintAndUnlock} data-tip data-for="mintAndUnlockTip">
                                    <img src="/panel/mint_unlock.png" alt="MINT AND UNLOCK" className="logo-big2"/>
                                </button>

                                <ReactTooltip id="mintAndUnlockTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Mint the needed door and key to unlock this door and unlock it afterward.
                                </ReactTooltip>
                            </div>
                        ) : (                       
                            <div className="flex items-center">
                                <button className="flex mx-1 mb-5 text-lg font-semibold bg-red-900 w-full text-white rounded-lg p-2 justify-center items-center shadow-xl hover:bg-gray-700"
                                    data-tip data-for="mintAndUnlockUnavailableTip">
                                    <img src="/panel/mint_unlock.png" alt="MINT AND UNLOCK" className="logo-big2"/>
                                </button>

                                <ReactTooltip id="mintAndUnlockUnavailableTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Not enough doors or keys to mint and unlock.
                                </ReactTooltip>
                            </div>
                        )}
 
                        <div className="flex items-center">
                            <button className="flex mx-1 mb-5 mr-2 text-lg font-semibold bg-gray-400 w-full text-white rounded-lg p-2 justify-center items-center shadow-xl hover:bg-gray-700"
                            data-tip data-for="openseaTip">
                                    <img src="/opensea.svg" alt="OPENSEA" className="logo-big2"/>
                            </button>


                            <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                            </ReactTooltip>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center pt-2">
                        <div className="flex items-center">
                            <button className="flex mx-1 mb-5 ml-2 text-lg font-semibold bg-red-900 w-full text-white rounded-lg p-2 justify-center items-center shadow-xl hover:bg-gray-700"
                                data-tip data-for="unlockedTip">
                                <img src="/panel/unlocked.png" alt="UNLOCK" className="logo-big2"/>
                            </button>

                            <ReactTooltip id="unlockedTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Door is already unlocked.
                            </ReactTooltip>
                        </div>
                        <div className="flex items-center">
                            <button className="flex mx-1 mb-5 text-lg font-semibold bg-red-900 w-full text-white rounded-lg p-2 justify-center items-center shadow-xl hover:bg-gray-700"
                                    data-tip data-for="unlockedTip">
                                <img src="/panel/unlocked.png" alt="MINT AND UNLOCK" className="logo-big2"/>
                            </button>

                            <ReactTooltip id="unlockedTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Door is already unlocked.
                            </ReactTooltip>
                        </div>
                        <div className="flex items-center">
                            <button className="flex mx-1 mb-5 mr-2 text-lg font-semibold bg-gray-600 w-full text-white rounded-lg p-2 justify-center items-center shadow-xl hover:bg-gray-700"
                                    onClick={viewOS} data-tip data-for="openseaTip">
                                    <img src="/opensea.svg" alt="OPENSEA" className="logo-big2"/>
                            </button>

                            <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                            </ReactTooltip>
                        </div>
                    </div>

                )
            ) : (
                (supply > 0 ? (
                    <div className="flex justify-center items-center pt-2">
                        <div className="flex items-center">
                            <button className="flex mx-1 mt-3 mb-5 ml-2 text-lg font-semibold bg-green-700 w-full text-white p-4 justify-center items-center rounded-lg shadow-xl hover:bg-gray-700"
                                onClick={mintAdd} data-tip data-for="addTip">
                                <img src="/panel/plus.png" alt="ADD" className="logo-bigger"/>
                            </button>

                            <ReactTooltip id="addTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Add this NFT to the mint list.
                            </ReactTooltip>
                        </div>
                        <div className="flex items-center rounded-lg">
                            <button className="flex mx-1 mt-3 mb-5 text-lg font-semibold bg-red-700 w-full text-white p-4 justify-center items-center rounded-lg shadow-xl hover:bg-gray-700"
                                onClick={mintRemove}  data-tip data-for="removeTip">
                                <img src="/panel/minus.png" alt="REMOVE" className="logo-bigger"/>
                            </button>

                            <ReactTooltip id="removeTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Remove this NFT from the mint list.
                            </ReactTooltip>
                        </div>

                        <div className="flex items-center">
                            <button className="flex mx-1 mt-3 mb-5 text-lg font-semibold bg-blue-700 w-full text-white p-4 justify-center items-center rounded-lg shadow-xl hover:bg-gray-700"
                                    onClick={mint} data-tip data-for="mintTip">
                                <img src="/panel/mint.png" alt="MINT" className="logo-bigger"/>
                            </button>

                            <ReactTooltip id="mintTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    Mint this NFT right away.
                            </ReactTooltip>
                        </div>

                        {(supply == maxQuantity ? (                        
                        
                            <div className="flex items-center">
                                <button className="flex mx-1 mt-3 mb-5 mr-2 text-lg font-semibold bg-gray-400 w-full text-white p-4 justify-center items-center rounded-lg shadow-xl hover:bg-gray-700"
                                 data-tip data-for="openseaTip">
                                    <img src="/opensea.svg" alt="OPENSEA" className="logo-bigger"/>
                                </button>

                                <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                                </ReactTooltip>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <button className="flex mx-1 mt-3 mb-5 mr-2 text-lg font-semibold bg-gray-400 w-full text-white p-4 justify-center items-center rounded-lg shadow-xl hover:bg-gray-700"
                                        onClick={viewOS} data-tip data-for="openseaTip">
                                    <img src="/opensea.svg" alt="OPENSEA" className="logo-bigger"/>
                                </button>

                                <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                    View this NFT on OpenSea.
                                </ReactTooltip>
                            </div>
                        ))}

                    </div>
                ) : (
                    <div className="flex justify-center items-center pt-2">
                        <div className="flex items-center">
                            <button className="flexmx-1 mt-3 mb-5 ml-2 text-lg font-semibold bg-red-900 w-full text-white rounded-lg p-4 shadow-xl"
                             data-tip data-for="soldoutTip">
                                <img src="/panel/minus.png" alt="REMOVE" className="logo-bigger"/>
                            </button>
                        </div>
                        <div className="flex items-center">
                            <button className="flex mx-1 mt-3 mb-5 text-lg font-semibold bg-green-900 w-full text-white rounded-lg p-4 shadow-xl"
                             data-tip data-for="soldoutTip">
                                <img src="/panel/plus.png" alt="ADD" className="logo-bigger"/>
                            </button>
                        </div>
                        <div className="flex items-center">
                            <button className="flex mx-1 mt-3 mb-5 text-lg font-semibold bg-blue-900 w-full text-white rounded-lg p-4 shadow-xl"
                            data-tip data-for="soldoutTip">
                                <img src="/panel/mint.png" alt="MINT" className="logo-bigger"/>
                            </button>
                        </div>

                        <ReactTooltip id="soldoutTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                This door is sold out.
                        </ReactTooltip>

                        <div className="flex items-center">
                            <button className="flex mx-1 mt-3 mb-5 mr-2 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg p-4 shadow-xl hover:bg-gray-700"
                                    onClick={viewOS} data-tip data-for="openseaTip">
                                    <img src="/opensea.svg" alt="OPENSEA" className="logo-bigger"/>
                            </button>

                            <ReactTooltip id="openseaTip" place="top" effect="solid" type="dark" className="font-medium text-textColor bg-backgroundColor rounded-bg">
                                View this NFT on OpenSea.
                            </ReactTooltip>
                        </div>
                    </div>
                ))

            ))}

            



        </div>
    </div>

    )
}

export default DoorPanel

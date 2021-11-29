import React from 'react'
import ReactTooltip from 'react-tooltip';
import { useState } from 'react';
import { ethers } from "ethers";

import { contractAddrClosedRinkeby, contractAddrOpenedRinkeby, keyIds, doorPriceIds, quantities, supplies } from "../config";

const DoorPanel = ({_prices, updateFunc, meta, _supply, _opened, _useVideo}) => {

    const converter = ethers.BigNumber.from("1000000000000000");
    const currentBatch = 1;

    const [opened, setOpened] = useState(_opened);
    const [useVideo, setUseVideo] = useState(_useVideo);
    const [price, setPrice] = useState(_price);

    console.log(meta);
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

    if (_opened) {
        closedId = meta.closed_id;
        doorOption = meta.attributes[3].value - 1;
        updateFunc("init", closedId, keyIds[doorClass], doorOption, updateSupply);
    } else {
        updateFunc("init", tokenId, price, updateSupply);
    }

    var maxQuantity = 1;
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
    const [canMintAndUnlock, setCanMintAndUnlock] = useState(false);

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

    function updateSupply(_dSupply) {
        setSupply(supply - dSupply);
    }

    function viewOS() {
        var url = "https://testnets.opensea.io/assets/";
        if (opened) {
            url = url + contractAddrOpenedRinkeby + "/" + tokenId.toString();
        }
        else {
            url = url + contractAddrClosedRinkeby + "/" + tokenId.toString();
        }
        window.open(url, '_blank').focus();
    }

    function openImage() {
        window.open(image, '_blank').focus();
    }

    async function mint() {
        const dSupply = await updateFunc("mint", tokenId, _price);
        setSupply(supply - dSupply);
    }

    async function mintAdd() {
        if (selectedSupply < supply) {
            const dSelection = await updateFunc("add", tokenId, _price);
            setSelectedSupply(selectedSupply + dSelection);
            console.log(dSelection);
            console.log("Added: ", tokenId, " - ", selectedSupply);
        }
    }

    async function mintRemove() {
    if (selectedSupply > 0) {
        const dSelection = await updateFunc("remove", tokenId, _price);
        setSelectedSupply(selectedSupply - dSelection);
        console.log("Removed: ", tokenId, " - ", selectedSupply);
        }
    }

    async function mintAndUnlock() {
        if (canMintAndUnlock) {
            const dSupply = await updateFunc("mintUnlock", closedId, keyIds[doorClass], doorOption);
            setSupply(supply - dSupply);
        }
    }

    async function unlockDoor() {
        const dSupply = await updateFunc("unlock", closedId, keyIds[doorClass], doorOption);
        setSupply(supply - dSupply);
    }

    async function unlockAdd() {

    }

    async function unlockRemove() {

    }

    return (

    <div className="max-w-full items-center justify-center w-3/8 relative rounded-lg shadow-lg sm:my-5 my-8  md:mr-2 ml-2">
        <div className="bg-white text-gray rounded-lg shadow-lg overflow-hidden items-center justify-center">
            <div className="block text-left text-sm sm:text-md max-w-sm mx-auto mt-2 text-black px-8 lg:px-6">
                <h1 className="text-lg font-medium uppercase p-3 pb-0 text-center tracking-wide">
                    {name} 
                </h1>

                
            </div>

            <button className="items-center justify-center flex flex-wrap mt-2 px-6" onClick={openImage}>
                <ul>
                    {useVideo ? (
                         <video src={AnimationUrl} playsInline={true} loop={true} controls={false} autoPlay={true} muted={true} className="rounded-xl items-center justify-center w-full object-cover object-center"></video>
                    ) : (
                        <img src={image} alt="" className="rounded-xl items-center justify-center w-full object-cover object-center"></img>
                    ) }
                   
                    
                    
                </ul> 
            </button>  

            
            {opened ? (<div></div>) : (
                            <div>
                            <h2 className="text-lg font-bold text-gray-700 text-center pt-6 uppercase">SUPPLY {supply} / {maxQuantity}</h2>        
                            <h2 className=" flex text-2xl font-bold text-gray-700 items-center justify-center text-center py-1 uppercase">
                                <img src="/eth.svg" alt="ETH" className="logo"/> {price}
                            </h2>               
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
                                Unlock this door if you own the right coor and key.
                            </ReactTooltip>
                        </div>
                        {(canMintAndUnlock) ? (                       
                            <div className="flex items-center px-8">
                                <button className="mt-3 text-lg font-semibold bg-green-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={unlockDoor} data-tip data-for="mintAndUnlockTip">
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
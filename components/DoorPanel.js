import React from 'react'
import { useState } from 'react';
import Home from '../pages/index'

import { contractAddrClosedRinkeby, contractAddrOpenedRinkeby, keyIds, doorPriceIds, quantities, supplies } from "../config";

const DoorPanel = ({_prices, updateFunc, meta, _supply, _opened, _useVideo}) => {


    const currentBatch = 1;

    const [opened, setOpened] = useState(_opened);
    const [useVideo, setUseVideo] = useState(_useVideo);

    //console.log(meta);
    const name = meta.name;
    const image = meta.image;
    const tokenId = meta.token_id;
    const doorClass = meta.attributes[1].value;

    //var home = updateFunc(tokenId, this);
    //console.log(home);

    var _price = 1;
    if (tokenId < 4) {
        _price = _prices[keyIds[doorClass]];
    }
    else {
        _price = _prices[doorPriceIds[doorClass]];
    }


    const [price, setPrice] = useState(_price);
    //console.log(price)
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

    //console.log(tokenId);



    var [canMintAndUnlock, setCanMintAndUnlock] = useState(false);
    if (opened) {

    }

    var AnimationUrl = "";
    if (_useVideo) {
        AnimationUrl = meta.animation_url;
    }
    else {
        AnimationUrl = meta.image_url;
    }

    var selectedAmount = 0;

    function arrayRemove(arr, value) { 
    
        return arr.filter(function(ele){ 
            return ele != value; 
        });
    }

    function addSelection() {
        if (Home.selectedClosedTokens.length < 10 && selectedAmount < supply) {
            Home.selectedClosedTokens.push(tokenId);
            selectedAmount++;
            console.log("Added: ", tokenId);
        }
    }

    function removeSelection() {
        if (Home.selectedClosedTokens.length >0 && selectedAmount > 0) {
            Home.selectedClosedTokens.arrayRemove(tokenId);
            selectedAmount--;
            console.log("Removed: ", tokenId);
        }
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

    async function mint() {
        await updateFunc("mint", tokenId, _price);
    }

    async function mintAdd() {

    }

    async function mintRemove() {

    }

    async function mintAndUnlock() {

    }

    async function unlockDoor() {
        console.log("testt");
        updateFunc("unlock", meta.closed_id, keyIds[doorClass], meta.attributes[3].value - 1);
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

            <div className="items-center justify-center flex flex-wrap mt-2 px-6">
                <ul>
                    {useVideo ? (
                         <video src={AnimationUrl} playsInline={true} loop={true} controls={false} autoPlay={true} muted={true} className="rounded-xl items-center justify-center w-full object-cover object-center"></video>
                    ) : (
                        <img src={image} alt="" className="rounded-xl items-center justify-center w-full object-cover object-center"></img>
                    ) }
                   
                    
                    
                </ul> 
            </div>  

            
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
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                onClick={unlockDoor}>
                                UNLOCK
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-red-900 w-full disabled text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700">
                                DOOR UNLOCKED
                            </button>
                        </div>
                    </div>
                )
            ) : (

                (supply > 0 ? (

                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-red-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                onClick={mintRemove}>
                                REMOVE
                            </button>
                        </div>
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-green-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                onClick={mintAdd}>
                                ADD
                            </button>
                        </div>
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={mint} >
                                MINT
                            </button>
                        </div>


                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={viewOS} >
                                VIEW ON OPENSEA
                            </button>
                        </div>
                    </div>


                ) : (

                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8 uppercase">
                            <button className="disabled mt-3 text-lg font-semibold bg-red-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl">
                                SOLD OUT
                            </button>
                        </div>
                        <div className="flex items-center px-8 uppercase">
                            <button className="disabled mt-3 text-lg font-semibold bg-green-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl">
                                SOLD OUT
                            </button>
                        </div>
                        <div className="flex items-center px-8 uppercase">
                            <button className="disabled mt-3 text-lg font-semibold bg-blue-900 w-full text-white rounded-lg px-6 py-3 block shadow-xl">
                                SOLD OUT
                            </button>
                        </div>

                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={viewOS} >
                                VIEW ON OPENSEA
                            </button>
                        </div>
                    </div>

                ))

            ) }



        </div>
    </div>

    )
}

export default DoorPanel
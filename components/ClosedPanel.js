import React from 'react'
import Home from '../pages/index'

const ClosedPanel = (meta, supply, unlock, useVideo = false) => {

    console.log(meta);
    const name = meta.meta.name;
    const image = meta.meta.image;

    
    if (useVideo) {
        const AnimationUrl = meta.meta.animation_url;
    }
    else {
        const AnimationUrl = meta.meta.image_url;
    }

    const tokenId = meta.meta.tokenId;

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

    function test()
    {
        unlock = !unlock
        console.log(unlock)

        //   sm:w-3/5 lg:w-1/3 
    }



    return (

    <div className="max-w-full items-center justify-center w-3/8 relative rounded-lg shadow-lg sm:my-5 my-8  md:mr-2 ml-2">
        <div className="bg-white text-gray rounded-lg shadow-lg overflow-hidden items-center justify-center">
            <div className="block text-left text-sm sm:text-md max-w-sm mx-auto mt-2 text-black px-8 lg:px-6">
                <h1 className="text-lg font-medium uppercase p-3 pb-0 text-center tracking-wide">
                    {name} 
                </h1>
                <h2 className="text-sm text-gray-500 text-center pb-6">PRICE</h2>
                <h2 className="text-sm text-gray-500 text-center pb-6">DESCRIPTION</h2>
                
            </div>

            <div className="items-center justify-center flex flex-wrap mt-3 px-6">
                <ul>
                    {useVideo ? (
                         <video src={AnimationUrl} playsInline={true} loop={true} controls={false} autoPlay={true} class="items-center justify-center w-full object-cover object-center"></video>
                    ) : (
                        <img src={image} alt="" class="items-center justify-center w-full object-cover object-center"></img>
                    ) }
                   
                    
                    
                </ul> 
            </div>  
            {unlock ? (
                <div className="row justify-center items-center pt-2 pb-6">
                    <div className="flex items-center px-8 uppercase">
                        <button className="mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700">
                            UNLOCK
                        </button>
                    </div>
                </div>
            ) : (

                (supply > 0 ? (

                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-red-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700">
                                REMOVE
                            </button>
                        </div>
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-green-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700">
                                ADD
                            </button>
                        </div>
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={test} >
                                MINT
                            </button>
                        </div>


                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={test} >
                                VIEW ON OPENSEA
                            </button>
                        </div>
                    </div>


                ) : (

                    <div className="row justify-center items-center pt-2 pb-6">
                        <div className="flex items-center px-8 uppercase">
                            <button className="mt-3 text-lg font-semibold bg-lightBlue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                                    onClick={test} >
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

export default ClosedPanel
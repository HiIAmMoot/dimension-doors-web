import React from 'react'
import Home from '../pages/index'

const ClosedPanel = (meta) => {

    const name = meta.meta.name;
    const image = meta.meta.image;
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
        console.log(name)
    }



    return (

        <div className="w-11/12 max-w-sm sm:w-3/5 lg:w-1/3 sm:my-5 my-8 relative z-0 rounded-lg shadow-lg md:mr-2 ml-2">
        <div className="bg-white text-gray rounded-lg shadow-inner shadow-lg overflow-hidden">
            <div className="block text-left text-sm sm:text-md max-w-sm mx-auto mt-2 text-black px-8 lg:px-6">
                <h1 className="text-lg font-medium uppercase p-3 pb-0 text-center tracking-wide">
                    {name} 
                </h1>
                <h2 className="text-sm text-gray-500 text-center pb-6">PRICE</h2>
                
                DESCRIPTION
            </div>

            <div className="flex flex-wrap mt-3 px-6">
                <ul>
                    <img src= {image}></img>
                    
                    
                </ul> 
            </div>  
            <div className="flex items-center px-8 pt-8 uppercase">
                <button className="mt-3 text-lg font-semibold bg-red-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700">
                    REMOVE
                </button>
            </div>
            <div className="flex items-center px-8 uppercase">
                <button className="mt-3 text-lg font-semibold bg-green-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700">
                    ADD
                </button>
            </div>
            <div className="flex items-center px-8 pb-8 uppercase">
                <button className="mt-3 text-lg font-semibold bg-blue-700 w-full text-white rounded-lg px-6 py-3 block shadow-xl hover:bg-gray-700"
                        onClick={test} >
                    MINT NOW
                </button>
            </div>
        </div>
    </div>

    )
}

export default ClosedPanel
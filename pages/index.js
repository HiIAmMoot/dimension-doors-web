import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import NavBar from '@components/NavBar'
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
export default function Home() {
  //const classes = styles(); 
  return (
    
    <div className="main">
      <NavBar/>

      <div class="wrapper">

        <div class="md:flex space-x-16 mt-5 md:mr-0 mr-10">
          <div class="md:flex items-center pl-128 pr-128">
            <div class="styles_container__16cxk ">
              <video class="styles_video__32uJf" playsinline="true" loop="true" controls={false} src="https://ipfs.io/ipfs/bafybeif6ln7uwezeqkeba7cdnraqqcvxa4jtxdqerml5mjhbcf7fmaahhq/S_Transition.mp4" autoplay="true"> </video>
            </div>
          </div>
        </div>


        <div class="md:flex space-x-16 mt-5 md:mr-0 mr-10 pl-80 pr-80">
            <div class="md:flex items-center">
              <div class="">
                <h1 class="text-mainColor lg:text-5xl  font-bold leading-tight text-3xl">Dimension Doors</h1>
                <p class="text-mainColor mt-4 text-lg font-normal ">Dimension Doors is a collection of 3504 NFTs—unique digital collectibles living on the Ethereum blockchain. This collection consists of 4 keys, 500 closed doors and 3000 open doors. Each closed door can have different quantities based on its class: S, A, B or C. Respectively consisting of 1, 2, 5, 10 quantities per closed door. Once you own a closed door an a key of that class, you can unlock that specific door and choose an 1/1 opened door NFT. Unlocking an open door will burn the closed door and key, and mint the open door of your choosing. Because each closed Dimension Door is hand-drawn, it will take time to finish the whole collection. That's why drops will happen in 50 batches consisting of the same ratios and quantities per class. </p><br></br>
                  
              </div>
            </div>
            <div class="max-w-lg pr-24 md:flex justify-center items-center hidden">
              <img class="rounded-lg" src="https://bafybeiaz3yv4f62llnfd2yaes3xzv7dtjexnergiiyuvru2tpgohnn4uhq.ipfs.dweb.link/keys/Key_A_preview.gif" alt=""></img>
            </div>
          </div>
        </div>

        <div class="pl-80 pr-80"><div class="border-top"></div></div>

        <div class="md:flex space-x-16 mt-5 md:mr-0 mr-10 pl-80 pr-80">
            <div class="md:flex items-center">
              <div class="">
                <h1 class="text-mainColor lg:text-5xl  font-bold leading-tight text-3xl">Dimension Doors</h1>
                <p class="text-mainColor mt-4 text-lg font-normal ">Dimension Doors is a collection of 3504 NFTs—unique digital collectibles living on the Ethereum blockchain. This collection consists of 4 keys, 500 closed doors and 3000 open doors. Each closed door can have different quantities based on its class: S, A, B or C. Respectively consisting of 1, 2, 5, 10 quantities per closed door. Once you own a closed door an a key of that class, you can unlock that specific door and choose an 1/1 opened door NFT. Unlocking an open door will burn the closed door and key, and mint the open door of your choosing. Because each closed Dimension Door is hand-drawn, it will take time to finish the whole collection. That's why drops will happen in 50 batches consisting of the same ratios and quantities per class. </p><br></br>
                  
              </div>
            </div>
            <div class="max-w-lg pr-24 md:flex justify-center items-center hidden">
              <img class="rounded-lg" src="https://images.unsplash.com/photo-1483058712412-4245e9b90334" alt=""></img>
            </div>
          </div>
        

        <Footer/>
    </div>
  )
}

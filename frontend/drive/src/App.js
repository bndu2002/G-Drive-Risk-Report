//import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Files from "./Files";
import Home from "./Home";



function App() {

  // const [scanClicked, setscanClicked] = useState(false)

  // const getAuth = async (req, res) => {
  //   try {

  //     let fetchObject = {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       Credential: "includes"

  //     }

  //     const response = await fetch("/auth", fetchObject)

  //     console.log(response)

  //     if (response.ok) {
  //       window.alert("all good")
  //       let data = await response.json()
  //       console.log(data.data)
  //       window.location.href = data.data
  //       setscanClicked(true)
  //     } else {
  //       let errorMsg = await response.json()
  //       window.alert("error occured")
  //     }

  //   } catch (error) {
  //     return console.log(error.message)
  //   }
  // }



  return (
    <>
      {/* {!scanClicked ? <div><h1>hello</h1>
        <button onClick={getAuth}>Scan my Google Drive</button></div>
        : null} */}
      <Routes>
        <Route path ="https://6458aedf7689dc000848a33c--meek-elf-f811cc.netlify.app" element={<Home />} />
        <Route path="https://6458aedf7689dc000848a33c--meek-elf-f811cc.netlify.app/auth/google/callback" element={<Files />} />
      </Routes>


    </>

  );
}

export default App;

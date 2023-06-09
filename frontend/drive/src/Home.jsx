import React from "react";

function Home() { 

  const backendUrl = "https://g-drive-risk-report-lvn6.vercel.app"
  const getAuth = async () => {
    try {
      let fetchObject = {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        Credential: "includes",
      };

      const response = await fetch(`/auth`, fetchObject);

      console.log(response);

      if (response.ok) {
        let data = await response.json();
        console.log(data.data);
        window.location.href = data.data;
        //setscanClicked(true);
      } else {
        let errorMsg = await response.json();
        window.alert(errorMsg);
      }
    } catch (error) {
      return console.log(error.message);
    }
  };


  return <>
  <div className="container">
  <h1 className="helo_style">Hi There !</h1>
  <button className="scan_btn" onClick={getAuth}>Scan my Google Drive</button>
  </div>
  
  </>;
}

export default Home;

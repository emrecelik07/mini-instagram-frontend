import {AppContext} from "../context/AppContext.jsx";
import {assets} from "../assets/assets.js";
import {useContext} from "react";


function WelcomePageContext(){
    const {userData} = useContext(AppContext);

    return(

        <div className="text-center d-flex flex-column align-items-center justify-content-center py-5 px-3"
             style={{minHeight: '80vh'}}>
            <img className="mb-0" src={assets.logoBig} alt="logo"  width="240"/>
            <h5 className={"fw-semibold"}>
                Hey There {userData ? userData.name + '!': '!'} <span role={"img"} aria-label={"wave"}>👋</span>
            </h5>

            <h1 className={"fw-bold display-5 mb-3"}>Welcome to Ministagram!</h1>

            <p className="text-muted fs-5 mb-4" style={{maxWidth: '500px'}}>

                Let's find your interests and post some stuff!
            </p>

            <button className="btn btn-outline-dark rounded-pill px-4 py-2">
                Let's go
            </button>


        </div>
    )
}
export default WelcomePageContext;
import {Navbar} from "react-bootstrap";
import WelcomePageContext from "../components/WelcomePageContext.jsx";
import AppNavbar from "../components/AppNavbar.jsx";


function WelcomePage() {


    return(
        <div className="flex flex-col items-center min-vh-100 justify-content-center">
            <AppNavbar/>
            <WelcomePageContext/>
        </div>
    )
}

export default WelcomePage;
import AppNavbar from "../components/AppNavbar.jsx";
import WelcomePageContext from "../components/WelcomePageContext.jsx";

function HomePage() {
    return (
        <div className="flex flex-col items-center min-vh-100 justify-content-center">
            <AppNavbar/>
            <WelcomePageContext/>
        </div>
    )
}

export default HomePage;
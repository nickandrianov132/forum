import HeaderLogo from "./content/HeaderLogo";
import UserPanel from "./userPanel/UserPanel";

const Header = () => {
    return (
        <header className="header-container">
            <nav className="nav-header">
                <HeaderLogo />
                {/* <UserPanel /> */}
            </nav>
            
        </header>
    );
}

export default Header;

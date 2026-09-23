import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";

import HeaderLogo from "./content/HeaderLogo";
import LoginForm from "./userPanel/LoginForm";
import UserAvatar from "./content/UserAvatar";
import LogoutBtn from "./content/LogoutBtn";
import LoginBtn from "./content/LoginBtn";

const Header = () => {
    const { accessToken, user } = useAppSelector(state => state.user)

    const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
    useEffect(() => {
        console.log(user);
    }, [user])
    console.log(user);
    console.log(accessToken);
    return (
        <header className="header-container">
            <nav className="nav-header">
                <HeaderLogo />
                {user !== null ? 
                    <div className="flex w-fit items-center">
                        <UserAvatar />
                        <LogoutBtn />
                    </div>
                    :
                    <LoginBtn setLoginForm={setIsLoginFormOpen} />
                }
            </nav>
            {isLoginFormOpen && 
                <LoginForm onClose={() => setIsLoginFormOpen(false)} />
            }
        </header>
    );
}

export default Header;

import { useEffect, useState } from "react";
import { useAppSelector } from "../../store/hooks";

import HeaderLogo from "./content/HeaderLogo";
import LoginForm from "./userPanel/LoginForm";
import UserAvatar from "./content/UserAvatar";
import LogoutBtn from "./content/LogoutBtn";
import LoginBtn from "./content/LoginBtn";
import { Link } from "react-router";
import { USER_REGISTRATION } from "../../utils/constants";

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
                    <div className="flex w-fit items-center gap-2">
                        <UserAvatar />
                        <LogoutBtn />
                    </div>
                    :
                    <div className="flex flex-col h-auto items-center justify-center gap-2">
                        <LoginBtn setLoginForm={setIsLoginFormOpen} />
                        <Link 
                            to={USER_REGISTRATION}
                            className="text-slate-300 text-sm hover:text-white" 
                        >Register</Link>
                    </div>
                }
            </nav>
            {isLoginFormOpen && 
                <LoginForm onClose={() => setIsLoginFormOpen(false)} />
            }
        </header>
    );
}

export default Header;

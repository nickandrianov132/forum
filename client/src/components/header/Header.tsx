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
                            className="relative inline-flex items-center text-xs font-medium text-cyan-400/80 hover:text-cyan-400 transition-colors duration-200 py-1 px-1.5 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/70 focus-visible:rounded-md active:scale-[101%]" 
                        >Register
                        <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400 shadow-[0_1px_6px_rgba(34,211,238,0.8)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                        </Link>
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

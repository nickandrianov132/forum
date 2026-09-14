import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import HeaderLogo from "./content/HeaderLogo";
import LoginForm from "./userPanel/LoginForm";

const Header = () => {
    const { accessToken } = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()
    const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);

    return (
        <header className="header-container">
            <nav className="nav-header">
                <HeaderLogo />
                {accessToken ? 
                    <button className="border border-slate-100 bg-sky-700 text-shadow-sm/20 text-shadow-blue-950 text-slate-200 py-0.5 px-1 rounded-md transition-colors active:bg-sky-500 hover:bg-sky-600 hover:border-white hover:text-white hover:shadow-md hover:shadow-sky-600/50"
                        onClick={() => dispatch(logout())}
                    >Logout</button>
                    :
                    <button className="border border-slate-200 bg-emerald-600 text-shadow-sm/20 text-shadow-emerald-950 text-slate-200 py-0.5 px-1 rounded-md transition-colors active:bg-emerald-400 hover:bg-emerald-500 hover:border-white hover:text-white hover:shadow-md hover:shadow-emerald-500/20"
                        onClick={() => setIsLoginFormOpen(true)}
                    >Login</button>
                }
            </nav>
            {isLoginFormOpen && 
                <LoginForm onClose={() => setIsLoginFormOpen(false)} />
            }
        </header>
    );
}

export default Header;

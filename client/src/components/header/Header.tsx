import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import HeaderLogo from "./content/HeaderLogo";
import LoginForm from "./userPanel/LoginForm";

const Header = () => {
    const { accessToken, user } = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()
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
                    <div className="flex  p-1 rounded-full bg-linear-to-tr from-blue-600 from-0% via-indigo-500 via-50% to-cyan-400 to-100% mr-2">
                        <img alt="avatar" title={user?.login} className="w-13 h-13 border-transparent rounded-full relative bg-gray-800" src={user?.avatar}/>
                    </div>
                    <button className="group inline-flex h-fit border border-slate-100 bg-linear-to-tr from-blue-800 from-0% via-sky-600 via-60% to-cyan-500 to-100% text-shadow-sm/20 text-shadow-blue-950 text-slate-200 py-0.5 px-1 rounded-md transition-colors duration-400 active:bg-sky-500 hover:bg-sky-600 hover:border-white hover:text-white hover:shadow-md hover:shadow-sky-600/50 "
                        onClick={() => dispatch(logout())}
                    >Logout
                        <svg className="w-4 ml-1 stroke-gray-200 stroke-2 group-hover:stroke-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12L2 12M2 12L5.5 9M2 12L5.5 15"  strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827"   strokeLinecap="round"/>
                        </svg>
                    </button>
                    </div>
                    :
                    <button className="group inline-flex h-fit border border-slate-200 bg-emerald-600 text-shadow-sm/20 text-shadow-emerald-950 text-slate-200 py-0.5 px-1 rounded-md transition-colors active:bg-emerald-400 hover:bg-emerald-500 hover:border-white hover:text-white hover:shadow-md hover:shadow-emerald-500/20"
                        onClick={() => setIsLoginFormOpen(true)}
                    >Login
                        <svg className="w-4 ml-1 stroke-gray-200 stroke-2 group-hover:stroke-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.00098 11.999L16.001 11.999M16.001 11.999L12.501 8.99902M16.001 11.999L12.501 14.999"  strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2L16.0002 2C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8L22.0002 16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.3531 21.8897 19.1752 21.9862 17 21.9983M9.00195 17C9.01406 19.175 9.11051 20.3529 9.87889 21.1213C10.5202 21.7626 11.4467 21.9359 13 21.9827"  strokeLinecap="round"/>
                        </svg>
                    </button>
                }
            </nav>
            {isLoginFormOpen && 
                <LoginForm onClose={() => setIsLoginFormOpen(false)} />
            }
        </header>
    );
}

export default Header;

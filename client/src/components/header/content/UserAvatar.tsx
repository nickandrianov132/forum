import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { Link } from "react-router";
import { ACCOUNT_INFO_ROUTE, ACCOUNT_SETTINGS_ROUTE } from "../../../utils/constants";


const UserAvatar = () => {
    const { user } = useAppSelector(state => state.user)
    const [isUserMenu, setIsUserMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenu(false)
            }
        }
        if (isUserMenu) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isUserMenu])

    const toggleMenu = () => setIsUserMenu((prev) => !prev)

    return (
        <div 
            ref={menuRef}
            onClick={toggleMenu}
            className="relative flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-2 pr-4 transition-all group cursor-pointer"
            // onClick={}
        >
            <svg 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenu ? "rotate-180" : ""}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {/* User Dropdown menu */}
            {isUserMenu && (
                <div
                    onClick={(e) => e.stopPropagation()} 
                    className="absolute z-50 top-full right-2 w-fit flex flex-col border border-slate-700/50 bg-slate-800 text-white rounded-b-md"
                >
                    <Link
                        to={ACCOUNT_INFO_ROUTE}
                        onClick={() => setIsUserMenu(false)}
                        className="px-3 py-2 text-sm transition-colors text-slate-200 hover:text-white hover:bg-sky-600/80 "
                    >My Account</Link>
                    <Link 
                        to={ACCOUNT_SETTINGS_ROUTE}
                        onClick={() => setIsUserMenu(false)}
                        className="px-3 py-2 rounded-b-md text-sm transition-colors text-slate-200 hover:text-white hover:bg-sky-600/80 "
                    >Settings</Link>
                </div>
            )}
            {/* Аватар */}
            <div className="p-0.5 rounded-full bg-linear-to-tr from-blue-500 via-indigo-500 to-cyan-400">
                <img 
                alt="avatar" 
                className="w-10 h-10 rounded-full bg-gray-800" 
                src={user?.avatar} 
                />
            </div>
            
            {/* Имя и кнопка */}
            <div className="group flex items-center gap-3">
                <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white">{user?.login}</span>
                <span className="text-[11px] text-slate-400 group-hover:text-sky-500">Profile</span>
                </div>
                
                    <svg className="w-4 h-4 group-hover:animate-[spin_1s_ease-in-out_1]" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"/>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"/>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M844.8 580.266667c2.133333-14.933333 4.266667-29.866667 4.266667-46.933334s-2.133333-32-4.266667-46.933333l96-68.266667c8.533333-6.4 12.8-19.2 6.4-29.866666L853.333333 230.4c-6.4-10.666667-17.066667-14.933333-27.733333-8.533333l-106.666667 49.066666c-25.6-19.2-51.2-34.133333-81.066666-46.933333L627.2 106.666667c-2.133333-10.666667-10.666667-19.2-21.333333-19.2h-183.466667c-10.666667 0-21.333333 8.533333-21.333333 19.2l-10.666667 117.333333c-29.866667 12.8-57.6 27.733333-81.066667 46.933333l-106.666666-49.066666c-10.666667-4.266667-23.466667 0-27.733334 8.533333l-91.733333 157.866667c-6.4 10.666667-2.133333 23.466667 6.4 29.866666l96 68.266667c-2.133333 14.933333-4.266667 29.866667-4.266667 46.933333s2.133333 32 4.266667 46.933334L85.333333 648.533333c-8.533333 6.4-12.8 19.2-6.4 29.866667L170.666667 836.266667c6.4 10.666667 17.066667 14.933333 27.733333 8.533333l106.666667-49.066667c25.6 19.2 51.2 34.133333 81.066666 46.933334l10.666667 117.333333c2.133333 10.666667 10.666667 19.2 21.333333 19.2h183.466667c10.666667 0 21.333333-8.533333 21.333333-19.2l10.666667-117.333333c29.866667-12.8 57.6-27.733333 81.066667-46.933334l106.666666 49.066667c10.666667 4.266667 23.466667 0 27.733334-8.533333l91.733333-157.866667c6.4-10.666667 2.133333-23.466667-6.4-29.866667l-89.6-68.266666zM512 746.666667c-117.333333 0-213.333333-96-213.333333-213.333334s96-213.333333 213.333333-213.333333 213.333333 96 213.333333 213.333333-96 213.333333-213.333333 213.333334z" className="fill-[#7c929c] group-hover:fill-slate-100/70"/>
                            <path d="M512 277.333333c-140.8 0-256 115.2-256 256s115.2 256 256 256 256-115.2 256-256-115.2-256-256-256z m0 362.666667c-59.733333 0-106.666667-46.933333-106.666667-106.666667s46.933333-106.666667 106.666667-106.666666 106.666667 46.933333 106.666667 106.666666-46.933333 106.666667-106.666667 106.666667z" className="fill-[#484e5c] group-hover:fill-blue-500/70"/>
                        </g>
                    </svg>
            </div>
        </div>

);
}

export default UserAvatar;

import { NavLink } from "react-router";
import { GUIDES_ROUTE, NEWS_ROUTE, POSTS_ROUTE } from "../../utils/constants";


const LeftNavbar = () => {

    return (
        <aside className="left-bar">
            <nav className="bg-gray-800 p-4 rounded-lg h-fit lg:h-full">
                <ul className="text-gray-300 text-sm">
                    <li className='nav-link'>
                        <NavLink to={NEWS_ROUTE}>
                            News
                        </NavLink>
                    </li>
                    <li className='nav-link'>
                        <NavLink to={POSTS_ROUTE}>
                            Posts
                        </NavLink>
                    </li>
                    <li className='nav-link'>
                        <NavLink to={GUIDES_ROUTE}>
                            Guides
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>

    );
}

export default LeftNavbar;

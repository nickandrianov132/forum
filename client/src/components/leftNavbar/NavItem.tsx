import { useNavigate } from "react-router";
import { POSTS_ROUTE } from "../../utils/constants";

const NavItem = () => {
    const navigate = useNavigate()

    return (
        <div>
            <a 
                className='text-red-500 hover:text-red-600 font-medium cursor-pointer'
                onClick={()=> navigate(POSTS_ROUTE)}
            >Posts</a>
        </div>
    );
}

export default NavItem;

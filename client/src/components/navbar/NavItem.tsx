import { useNavigate } from "react-router";
import { POSTS_ROUTE } from "../../utils/constants";

const NavItem = () => {
    const navigate = useNavigate()

    return (
        <div>
            <a 
                className='navbar_a'
                onClick={()=> navigate(POSTS_ROUTE)}
            >Posts</a>
        </div>
    );
}

export default NavItem;

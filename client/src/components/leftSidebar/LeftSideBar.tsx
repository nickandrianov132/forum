import LoginForm from "./LoginForm";
import { useAppSelector } from "../../store/hooks";
import UserPanel from "./userPanel/UserPanel";

const LeftSideBar = () => {
    const { accessToken } = useAppSelector((state) => state.user)
    console.log(accessToken);
    
    return (
        <div className="left_sidebar">
            {accessToken.length !== 0 
            ?
            <UserPanel/>
            :
            <LoginForm />
            }
        </div>
    );
}

export default LeftSideBar;

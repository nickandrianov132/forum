import { useAppSelector } from "../../../store/hooks";
import LoginForm from "./LoginForm.tsx";
import LogoutButton from "./LogoutButton";

const UserPanel = () => {
    const { accessToken } = useAppSelector((state) => state.user)
    console.log(accessToken);
    const isLoggedIn = !!accessToken;
    console.log(isLoggedIn);

    return (
        <div className="user_panel">
            {isLoggedIn 
                ?
                <LogoutButton />
                :
                <LoginForm />
            }
        </div>
    );
}

export default UserPanel;

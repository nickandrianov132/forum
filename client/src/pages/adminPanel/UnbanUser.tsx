import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { unbanUserSchema, type UnbanFormData } from "../../utils/unbanUserSchema";
import { useMutation } from "@apollo/client/react";
import { UNBAN_USER } from "../../graphql/mutations/unbanUser";
import SuccessPopup from "../../components/popups/SuccessPopup";

const UnbanUser = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.user);
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [unbanUser, {error: unbanUserError}] = useMutation(UNBAN_USER);
    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate("*");
        }
    },[])

    const handlerSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsSuccess(false);

        const formData = new FormData(e.currentTarget);
        const login = formData.get('login')
        const result = unbanUserSchema.safeParse({login});

        if (!result.success) {
                    setError("Incorrect Login");
                    return
        }

        const validatedData: UnbanFormData = result.data;
        console.log("Valid data is ready for send:", validatedData);
        try {
            await unbanUser({
                variables: {
                    ...validatedData
                }
            })
            setIsSuccess(true);
        } catch (error: any) {
            console.log(`Server Error: ${error.message}`);
        }
    }

    return (
        <div className="flex relative flex-col h-full w-full">
            {isSuccess && 
                <SuccessPopup message="User was successfuly unbnned!" buttonName="OK" setIsSuccess={setIsSuccess}/>
            }
            <form 
                onSubmit={handlerSubmit}
                className="login-form"
            >
                <div className="flex mb-5 items-center">
                    <div className="flex items-center">
                        <label htmlFor="login" className="form-label">User Login:</label>
                        <div className="form-input-container">
                            <input
                                className="form-input-clean"
                                id="login"
                                type="text"
                                name="login"
                                autoComplete="off"
                                required
                            />
                        </div>
                        {error && <p className="text-red-400 text-xs mt-1 ml-24">{error}</p>}
                    </div>
                </div>
                <button 
                    type="submit" 
                    className="admin-panel-btn"
                >Unban</button>   
            </form>
            {unbanUserError &&
                <span
                    className="mt-1 ml-4 text-xs font-medium text-rose-500"
                >{unbanUserError.message}</span>
            }
        </div>
    );
}

export default UnbanUser;

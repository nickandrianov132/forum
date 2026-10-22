import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { unbanUserSchema, type UnbanFormData } from "../../utils/unbanUserSchema";
import { useMutation } from "@apollo/client/react";
import { UNBAN_USER } from "../../graphql/mutations/unbanUser";

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
        } catch (error: any) {
            console.log(`Server Error: ${error.message}`);
        }
    }

    return (
        <div className="flex flex-col h-full w-full">
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
                    className="inline-flex h-fit max-w-50 items-center justify-center rounded-md border border-cyan-500/30 bg-slate-950/40 bg-linear-to-b from-slate-900/50 to-slate-950/80 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 ease-in-out hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
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

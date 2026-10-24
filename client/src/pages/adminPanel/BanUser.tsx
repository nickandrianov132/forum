import { useEffect, useState, type SubmitEvent } from "react";
import { useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router";
import { banUserSchema, type BanUserFormData } from "../../utils/banUserSchema";
import { useMutation } from "@apollo/client/react";
import { BAN_USER } from "../../graphql/mutations/banUser";
import SuccessPopup from "../../components/popups/SuccessPopup";


const BanUser = () => {
    const { user } = useAppSelector(store => store.user);
    const [errors, setErrors] = useState<Partial<Record<keyof BanUserFormData, string>>>({});
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const [banUser, {error: banUserError}] = useMutation(BAN_USER);


    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate("*");
        }
    },[])

    const handlerSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setIsSuccess(false);

        const formData = new FormData(e.currentTarget);
        // console.log(formData.get('duration'));
        const rawData = {
            login: formData.get('login'),
            reason: formData.get('reason'),
            durationInDays: formData.get('duration')
        }
        console.log(rawData);
        const result = banUserSchema.safeParse(rawData);
        // console.log(result);
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof BanUserFormData, string>> = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof BanUserFormData;
                fieldErrors[fieldName] = issue.message;
            });

            setErrors(fieldErrors);
            return
        }
        
        const validatedData: BanUserFormData = result.data;
        console.log("Valid data is ready to send:", validatedData);
        try {
            await banUser({
                variables: {
                    input: validatedData
                }
            })
            setIsSuccess(true);

        } catch (error: any) {
            console.log(`Server Error: ${error.message}`);
        }

    }

    return (
        <div className="flex relative flex-col h-full w-full">
            {isSuccess && (
                <SuccessPopup message="User was banned saccessfuly!" buttonName="OK"  setIsSuccess={setIsSuccess}/>
            )}
            <form className="login-form" onSubmit={handlerSubmit}>
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
                        {errors.login && <p className="text-red-400 text-xs mt-1 ml-24">{errors.login}</p>}
                    </div>
                </div>   
                <div className="flex mb-5 items-center">
                    <div className="flex items-center">
                        <label htmlFor="reason" className="form-label">Ban Reason:</label>
                        <div className="form-input-container">
                            <input
                                className="form-input-clean"
                                id="reason"
                                type="text"
                                name="reason"
                                autoComplete="off"
                                required
                            />
                        </div>
                        {errors.reason && <p className="text-red-400 text-xs mt-1 ml-24">{errors.reason}</p>}
                    </div>
                </div>
                <div className="flex mb-5 items-center">
                    <div className="flex items-center">
                        <label htmlFor="duration" className="form-label">Duration in days:</label>
                        <div className="form-input-container">
                            <input
                                className="form-input-clean"
                                id="duration"
                                type="number"
                                min={1}
                                max={100}
                                name="duration"
                                autoComplete="off"
                                required
                            />
                        </div>
                        {errors.durationInDays && <p className="text-red-400 text-xs mt-1 ml-24">{errors.durationInDays}</p>}
                    </div>
                </div>
                <button 
                    type="submit" 
                    className="inline-flex h-fit max-w-50 items-center justify-center rounded-md border border-cyan-500/30 bg-slate-950/40 bg-linear-to-b from-slate-900/50 to-slate-950/80 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 ease-in-out hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                >Ban</button>
            </form>
            {banUserError &&
                <span
                    className="mt-1 ml-4 text-xs font-medium text-rose-500"
                >{banUserError.message}</span>
            }
        </div>
    );
}

export default BanUser;

import { useState, type SubmitEvent } from "react";
import { regSchema, type RegistrationFormData } from "../utils/regSchema";
import { uploadMediaFile } from "../supabase/uploadService";
import { useMutation } from "@apollo/client/react";
import { ADD_USER } from "../graphql/mutations/createUser";
import Spinner from "../components/Spinner";

const baseAvatarUrl = "https://bqezaqgwkajiuqvwsuye.supabase.co/storage/v1/object/public/forum-media/avatars/user_icon2.png"

const Registration = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({})
    const [avatarUrl, setAvatarUrl] = useState("");
    const [addUerMutation, {error: userError, loading: userLoading}] = useMutation(ADD_USER, {
        onCompleted: () => {
            setAvatarUrl("");
        },
        onError: (err) => {
            console.log(`Server error: ${err.message}`);
        }
    })

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        setIsUploading(true);

        
        const uploadedUrl = await uploadMediaFile(file, 'avatars', "");
        setIsUploading(false);

        if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        }
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData(e.currentTarget);
        
        const rawData = {
            login: formData.get("login"),
            password: formData.get("password"),
            email: formData.get("email"),
            avatar: formData.get("avatar")
        };

        const result = regSchema.safeParse(rawData);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof RegistrationFormData;
                fieldErrors[fieldName] = issue.message;
            });

            setErrors(fieldErrors);
            return
        }

        const validatedData: RegistrationFormData = result.data;
        console.log("Valid data is ready for send:", validatedData);

        addUerMutation({
            variables: {
                ...validatedData,
            }
        })

    }

    
    if (userError) return (<div>{userError.message}</div>)

    return (
        <div className="flex items-center justify-center bg-slate-800 rounded-lg py-4">
            {userLoading ?
                <Spinner />
                :
                <form className="login-form" onSubmit={handleSubmit} >
                    {/* 1. Login field */}
                    <div className="flex mb-5 items-center">
                        <div className="flex items-center">
                            <label htmlFor="login" className="form-label">Login:</label>
                            <div className="form-input-container">
                                <input 
                                    className="form-input-clean"
                                    id="login"
                                    type="text" 
                                    name="login"
                                    autoComplete="off"
                                />
                            </div>
                            {!errors.login && <p className="text-red-400 text-xs mt-1 ml-24">{errors.login}</p>}
                        </div>
                    </div>

                    {/* 2. Password field */}
                    <div className="flex mb-5 items-center">
                        <div className="flex items-center">
                            <label htmlFor="password" className="form-label">Password:</label>
                            <div className="form-input-container">
                                <input 
                                    className="form-input-clean"
                                    type="password" 
                                    id="password"
                                    name="password"
                                    autoComplete='new-password'
                                    placeholder="••••••••" 
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1 ml-24">{errors.password}</p>}
                        </div>
                    </div>

                    {/* 3. Email field */}
                    <div className="flex mb-5 items-center">
                        <div className="flex items-center">
                            <label htmlFor="email" className="form-label">Email</label>
                            <div className="form-input-container">
                                <input 
                                    className="form-input-clean"
                                    type="text" 
                                    id="email"
                                    name="email"
                                    required
                                />
                            </div>
                        </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1 ml-24">{errors.email}</p>}
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                            <label 
                                htmlFor="user-avatar"
                                className="w-fit text-xs py-2 px-3 rounded-lg cursor-pointer text-slate-200 shadow-xs relative overflow-hidden bg-linear-to-tr from-sky-600 via-blue-700 to-indigo-500 before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent hover:before:animate-shimmer hover:-translate-y-0.5 active:text-white active:translate-y-0"
                            >
                                {isUploading ? "Uploading..." : "Upload Avatar"}
                            </label>
                            <input 
                                id="user-avatar"
                                type="file" 
                                name="user-avatar"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                hidden
                            />
                            <input 
                                type="hidden" 
                                name="avatar" 
                                value={avatarUrl} 
                            />
                            {isUploading && <span className="text-slate-400 text-sm animate-pulse ml-3">Image loading...</span>}
                            {avatarUrl && !isUploading && 
                            <div className="flex items-center">
                                <img src={avatarUrl} alt="Preview" className="w-10 h-10 rounded-full object-cover ml-3" />
                                <span className="text-emerald-400 text-md font-bold ml-3">✓</span>
                            </div>
                            }
                        </div>
                        {errors.avatar && <p className="text-red-400 text-xs mt-1 ml-24">{errors.avatar}</p>}
                    </div>
                    <button 
                        type="submit" 
                        className="inline-flex h-fit items-center justify-center rounded-md border border-cyan-500/30 bg-slate-950/40 bg-linear-to-b from-slate-900/50 to-slate-950/80 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 ease-in-out hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                    >Register</button>
                </form>
            }
        </div>
    );
}

export default Registration;

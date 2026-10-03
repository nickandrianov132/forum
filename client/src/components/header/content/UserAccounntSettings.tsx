import { useState, type SubmitEvent } from "react";
import { useAppSelector } from "../../../store/hooks";
import { uploadMediaFile } from "../../../supabase/uploadService";
import { useMutation } from "@apollo/client/react";
import { UPDATE_USER } from "../../../graphql/mutations/updateUser";
import  Spinner from "../../Spinner";


const UserAccountSettings = () => {
    const { user } = useAppSelector((state) => state.user)
    const [newPassword, setNewPassword] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);
    const [updateUserMutation, {error, loading}] = useMutation(UPDATE_USER, {
        onCompleted: (data) => {
            console.log(data);
            setAvatarUrl('');
            setNewPassword('');
            setSuccessMessage(true);
            
            setTimeout(() => setSuccessMessage(false), 3000);
        },
        onError: (error) => {
            console.log(error.message);
        }
    })

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const file = files[0];
        setIsUploading(true);

        
        const uploadedUrl = await uploadMediaFile(file, 'avatars', user?.id);
        setIsUploading(false);

        if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        }
    };

    const handlerUpdateUser = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return

        const updateInput: Record<string, string> = {};

        if (avatarUrl) {
            updateInput.avatar = avatarUrl;
        }
        if (newPassword) {
            updateInput.password = newPassword;
        }
        if (Object.keys(updateInput).length === 0) return;

        updateUserMutation({
            variables: {
                id: user.id,
                input: updateInput
            }
        });
    };

    const isSaveDisabled = !avatarUrl && !newPassword;

    return (
        <div className="flex flex-col w-full border border-slate-600/50 rounded-lg py-5 px-4 mt-2 bg-slate-800 h-full">
            {loading ? (
                <Spinner />
            ) : (
            <form onSubmit={handlerUpdateUser}>
                <div className="flex items-center gap-2 mb-4">
                    <label 
                        htmlFor="new-avatar"
                        className="w-fit text-sm py-2 px-3 rounded-lg cursor-pointer text-slate-200 shadow-xs relative overflow-hidden bg-linear-to-tr from-sky-600 via-blue-700 to-indigo-500 before:absolute before:inset-0 before:-translate-x-full before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent hover:before:animate-shimmer hover:-translate-y-0.5 active:text-white active:translate-y-0 hover"
                    >
                        {isUploading ? "Uploading..." : "Upload Avatar"}
                    </label>
                    <input 
                        id="new-avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        hidden
                    />
                    
                    {isUploading && <span className="text-slate-400 text-sm animate-pulse">Image loading...</span>}
                    {avatarUrl && !isUploading && <span className="text-emerald-400 text-sm font-medium">✓</span>}
                </div>
                <div>
                    <label
                        className="text-slate-300 mr-4"
                        htmlFor="new-password"
                    >Change Password:</label>
                    <input
                        id="new-password"
                        type="password"
                        className="w-60 text-lg tracking-widest px-3 py-1 rounded-lg bg-slate-950/40 border border-white/15 text-slate-100 focus:outline-hidden focus:border-sky-500/50 focus:bg-slate-950/60 font-medium transition-all"
                        minLength={4}
                        maxLength={12}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                </div>
                <div className="flex items-center gap-4 border-t border-slate-700 pt-4 mt-2">
                    <button
                        type="submit"
                        className="px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 avtive:scale-98 disabled:opacity-40 disabled:pointer-event-none rounded-lg transition-all"
                        disabled={isSaveDisabled}
                    >Save Changes
                    </button>
                    {successMessage && (
                        <span className="text-emerald-400 text-sm font-medium animate-fade-in">
                            ✓ The changes successfully saved!
                        </span>
                    )}
                    {error && (
                        <span className="text-rose-400 text-sm">
                            {error.message}
                        </span>
                    )}
                </div>
            </form>
            )
        }
        </div>
    );
}

export default UserAccountSettings;

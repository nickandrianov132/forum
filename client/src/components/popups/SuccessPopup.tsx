import type { Dispatch, SetStateAction } from "react";



interface ISuccessProps {
    message: string
    buttonName: string
    setIsSuccess: Dispatch<SetStateAction<boolean>>;
}

const SuccessPopup = ({message, buttonName, setIsSuccess}: ISuccessProps) => {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs rounded-xl transition-all duration-300">
            <div className="flex flex-col items-center justify-between p-6 border border-emerald-500/20 rounded-xl bg-slate-900 min-w-72 min-h-40 max-h-fit shadow-2xl shadow-emerald-950/60">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                    <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <span className="text-sm font-medium text-slate-200 text-center mb-5">
                    {message}
                </span>
                <button 
                    className="w-full inline-flex justify-center items-center h-9 font-semibold text-sm bg-emerald-500 text-slate-950 rounded-lg cursor-pointer transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-98"
                    onClick={() => setIsSuccess(false)}
                >{buttonName}
                </button>
            </div>
        </div>
    );
}

export default SuccessPopup;

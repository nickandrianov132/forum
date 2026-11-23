import type { Dispatch, SetStateAction } from "react";



interface ISuccessProps {
    message: string
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmPopup = ({message, confirmText = "Ok", cancelText = "Cancel", onConfirm, onCancel}: ISuccessProps) => {
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs rounded-xl transition-all duration-300">
            <div className="flex flex-col max-w-80 items-center justify-between p-6 border border-orange-500/20 rounded-xl bg-slate-900 min-w-72 min-h-40 max-h-fit shadow-2xl shadow-red-700/20">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-300/10 text-orange-500 border border-orange-500/30 mb-2">
                    <svg
                    xmlns="http://w3.org"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v10.5m0 4.5h.01"
                    />
                    </svg>
                </div>
                <span className="text-sm font-medium text-slate-300 text-center mb-6">
                    {message}
                </span>
                <div className="flex justify-around w-full">
                <button 
                    className="inline-flex w-18 justify-center items-center h-9 font-semibold text-sm bg-red-500/90 text-slate-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-rose-500 hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0"
                    onClick={onConfirm}
                >{confirmText}
                </button>
                <button 
                    className="inline-flex w-18 justify-center items-center h-9 font-semibold text-sm text-slate-200 bg-indigo-700 rounded-lg cursor-pointer transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
                    onClick={onCancel}
                >{cancelText}
                </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmPopup;

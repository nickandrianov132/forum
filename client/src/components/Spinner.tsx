

const Spinner = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-16">
            <div className="relative flex h-16 w-16 items-center justify-center transform-gpu">     
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-sky-500 to-indigo-600 blur-lg opacity-20 animate-pulse"></div>
                <div className="h-12 w-12 rounded-full border-4 border-slate-800 border-t-sky-400 border-r-indigo-500 animate-spin"></div>
                </div>
                <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase animate-pulse">
                    Loading...
                </span>
            </div>
    );
}

export default Spinner;

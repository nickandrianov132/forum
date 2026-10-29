import { useAppSelector } from "../../../store/hooks";

const UserAccauntInfo = () => {
    const { user } = useAppSelector((store) => store.user);

    return (
        <div className="user-panel-container">
            <div className="flex gap-4 p-4 text-slate-200">
                <div className="group flex flex-col items-center gap-3 rounded-2xl bg-slate-800/40 p-4 border border-slate-700/30 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-600/40">
                    <div className="relative">
                        <img 
                        className="w-30 h-30 rounded-full object-cover border-2 border-sky-500/70 p-1 shadow-lg shadow-sky-500/10 transition-transform duration-200 group-hover:scale-105 group-hover:border-sky-400"
                        src={user?.avatar || '/default-avatar.png'} 
                        alt="User Avatar"
                        title={user?.avatar}
                        />
                        <span className="absolute bottom-0 right-1 block h-4 w-4 rounded-full bg-emerald-400 border-2 border-slate-800 shadow-md"></span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/60 px-2 py-0.5 text-[11px] font-medium text-slate-400 border border-slate-700/50 tracking-wider font-mono">
                        <span className="text-sky-400/70 font-semibold">#</span>
                        {user?.id}
                    </span>
                </div>
                <div className="flex flex-col gap-2.5 w-full max-w-60">

                <div className="flex items-center justify-between rounded-xl bg-slate-900/50 px-3.5 py-2 border border-slate-800/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Login</span>
                    <span className="text-sm font-medium text-slate-200">{user?.login}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900/50 px-3.5 py-2 border border-slate-800/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Role</span>
                    <span className="text-sm font-semibold text-sky-400">{user?.role}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-900/50 px-3.5 py-2 border border-slate-800/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] backdrop-blur-sm">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Status</span>
                    {user?.isBanned ? (
                    <span className="text-sm font-bold text-rose-500 bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-800/40">Banned</span>
                    ) : (
                    <span className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-green-600/40">Commoner</span>
                    )}
                </div>
</div>
            </div>
        </div>
    );
}

export default UserAccauntInfo;

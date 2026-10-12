import { useMutation } from "@apollo/client/react";
import { SEND_MESSAGE } from "../../../../graphql/mutations/sendMessage";
import type { SubmitEvent } from "react";
import { useAppSelector } from "../../../../store/hooks";
import { z } from 'zod';

const messageSchema = z.object({
  // text автоматически станет строго строкой (string)
    message: z.string().trim().min(1, "Сообщение не должно быть пустым"),
});

const ChatFooter = () => {
    const { user } = useAppSelector((state) => state.user);
    const [sendMessage] = useMutation(SEND_MESSAGE);

    const handlerSendMesage = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("message Handler");
        if (!user) return;

        const form = e.currentTarget; 
        
        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData.entries());
        const result = messageSchema.safeParse(rawData);

        if (!result.success) {
            console.log(result.error.format());
            return;
        }

        try {
            await sendMessage({
                variables: {
                    text: result.data.message,
                    userId: user.id
                }
            });
            
            form.reset(); 
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
            <form
                onSubmit={handlerSendMesage}
                className="flex w-full items-end gap-2 bg-slate-900/90 p-1 rounded-lg border border-slate-700 focus-within:border-sky-500/50 focus-within:ring-0.5 focus-within:ring-sky-500 transition-all" 
            >
                <div className="flex w-full py-3 px-1">
                    <label htmlFor="message">
                    </label>
                    <div className="flex-1 min-w-0 bg-slate-800 rounded-lg border border-slate-700 focus-within:border-sky-500/70 transition-colors">
                        <textarea
                            className="w-full resize-none bg-transparent py-2 px-3 text-sm text-slate-100 placeholder-slate-500 outline-none max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700"
                            required
                            name="message"
                            id="message"
                        />
                    </div>

                </div>
                <button
                    className="inline-flex h-fit max-w-30 items-center justify-center rounded-md border border-cyan-500/30 bg-slate-950/40 bg-linear-to-b from-slate-900/50 to-slate-950/80 px-3 py-2 text-xs font-semibold tracking-wider text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-colors duration-200 ease-in-out hover:border-cyan-400 hover:text-slate-200 hover:shadow-[0_0_8px_rgba(6,182,212,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:shadow-[0_0_16px_rgba(6,182,212,0.4),inset_0_1px_3px_rgba(255,255,255,0.2)] active:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                    type="submit"
                >Send</button>
            </form>

        </div>
    );
}

export default ChatFooter;

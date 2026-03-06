"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
    MessageSquare,
    Send,
    Loader2,
    User,
    Mail,
    Clock,
    CheckCircle2,
    HelpCircle,
    Search
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function QueriesAdmin() {
    const { data, error, mutate } = useSWR("/api/queries", fetcher);
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [answerText, setAnswerText] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleAnswerSubmit = async (queryId: string) => {
        if (!answerText.trim()) return toast.error("Answer cannot be empty");

        setLoading(true);
        try {
            const res = await fetch("/api/queries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: queryId, answer: answerText }),
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            toast.success("Response sent to candidate!");
            setAnsweringId(null);
            setAnswerText("");
            mutate();
        } catch (err: any) {
            toast.error(err.message || "Failed to post answer");
        } finally {
            setLoading(false);
        }
    };

    const filteredQueries = data?.data?.filter((q: any) =>
        q.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Candidate Queries</h1>
                    <p className="text-gray-500 text-sm font-medium">Respond to user questions and provide mentorship support.</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search queries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                    />
                </div>
            </div>

            <div className="space-y-6">
                {error && (
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-center font-bold">
                        Failed to load queries. Connection lost.
                    </div>
                )}

                {!data && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                )}

                {data && (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredQueries.map((query: any) => (
                            <div key={query._id} className="group bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 hover:border-white/10 shadow-xl shadow-black/20">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    <div className="md:w-64 shrink-0 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                                                {query.userName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{query.userName}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{query.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                {new Date(query.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${query.status === 'answered'
                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                {query.status === 'answered' ? <CheckCircle2 className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                                                {query.status}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {/* Render Chat History */}
                                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                            {query.messages && query.messages.map((msg: any, index: number) => (
                                                <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}>
                                                    <div className={`p-4 rounded-2xl max-w-[90%] ${msg.sender === 'user'
                                                        ? 'bg-white/[0.02] border border-white/5 rounded-tl-sm'
                                                        : 'bg-emerald-500/5 border border-emerald-500/10 rounded-tr-sm'
                                                        }`}>
                                                        {msg.sender === 'admin' && (
                                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Official Response
                                                            </p>
                                                        )}
                                                        {msg.sender === 'user' && (
                                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">
                                                                Question
                                                            </p>
                                                        )}
                                                        <p className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'text-gray-200 capitalize font-medium' : 'text-gray-300 italic'}`}>
                                                            {msg.sender === 'admin' ? `"${msg.text}"` : msg.text}
                                                        </p>
                                                        <div className={`text-[10px] text-gray-500 mt-2 font-medium flex items-center gap-1 ${msg.sender === 'admin' ? 'justify-end' : ''}`}>
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Reply Area */}
                                        <div className="pt-4 border-t border-white/5 mt-4">
                                            <div className="space-y-4">
                                                {answeringId === query._id ? (
                                                    <div className="animate-in slide-in-from-top-4 duration-300">
                                                        <textarea
                                                            rows={3}
                                                            value={answerText}
                                                            onChange={(e) => setAnswerText(e.target.value)}
                                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700 resize-none shadow-inner"
                                                            placeholder="Type your response to continue the thread..."
                                                        />
                                                        <div className="flex justify-end gap-3 mt-3">
                                                            <button
                                                                onClick={() => { setAnsweringId(null); setAnswerText(""); }}
                                                                className="px-5 py-2 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                                                            >
                                                                Discard
                                                            </button>
                                                            <button
                                                                onClick={() => handleAnswerSubmit(query._id)}
                                                                disabled={loading}
                                                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                                            >
                                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                                {loading ? "Sending..." : "Reply to Thread"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setAnsweringId(query._id); setAnswerText(""); }}
                                                        className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.99]"
                                                    >
                                                        Continue Thread
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredQueries.length === 0 && (
                            <div className="py-24 text-center space-y-6 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-800 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                    <MessageSquare className="w-10 h-10" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg mb-1">No matches found</p>
                                    <p className="text-gray-500 text-xs font-medium max-w-xs mx-auto">Try adjusting your search filters to find what you're looking for.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

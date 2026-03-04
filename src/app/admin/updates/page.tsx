"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
    Plus,
    Image as ImageIcon,
    Loader2,
    Trash2,
    Calendar,
    Clock,
    FileText
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UpdatesAdmin() {
    const { data, error, mutate } = useSWR("/api/updates", fetcher);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            if (file) {
                formData.append("file", file);
            }

            const res = await fetch("/api/updates", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            toast.success("Update published successfully!");
            setTitle("");
            setDescription("");
            setFile(null);
            setShowForm(false);
            mutate();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Manage Updates</h1>
                    <p className="text-gray-500 text-sm font-medium">Broadcast news and important announcements to all users.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    {showForm ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Post New Update"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-in zoom-in-95 duration-300 shadow-2xl shadow-blue-500/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Create Announcement
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                    placeholder="E.g., Upcoming Webinar Session"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Media (Optional)</label>
                                <div className="relative group/file">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setFile(e.target.files[0]);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full bg-white/[0.03] border border-white/5 group-hover/file:border-blue-500/30 rounded-2xl p-4 text-gray-500 flex items-center gap-3 transition-all">
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm truncate">
                                            {file ? file.name : "Choose an image to upload..."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Content Description</label>
                            <textarea
                                required
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700 resize-none"
                                placeholder="Details of the announcement..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? "Publishing..." : "Publish Broadcast"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/5" />
                    <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Recent History</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                {error && (
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-center font-bold">
                        Failed to synchronize updates. Please try again later.
                    </div>
                )}

                {!data && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                )}

                {data && data.data && (
                    <div className="grid grid-cols-1 gap-6">
                        {data.data.map((update: any) => (
                            <div key={update._id} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-6 rounded-3xl transition-all duration-500 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                                {update.fileId && (
                                    <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative group-hover:scale-[1.02] transition-transform duration-500">
                                        <img
                                            src={`/api/files/${update.fileId._id || update.fileId}`}
                                            alt={update.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">View Attachment</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex-1 flex flex-col justify-center py-2">
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.15em] text-blue-500 mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(update.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {new Date(update.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{update.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">{update.description}</p>
                                </div>
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.data.length === 0 && (
                            <div className="py-20 text-center space-y-4 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-700">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">No updates found in the database.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import useSWR from "swr";
import { useState } from "react";
import toast from "react-hot-toast";
import {
    Users,
    Search,
    Shield,
    ShieldCheck,
    Trash2,
    MoreVertical,
    Mail,
    Calendar,
    Loader2
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UsersAdmin() {
    const { data, error, mutate } = useSWR("/api/admin/users", fetcher);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

        setUpdatingId(userId);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId, role: newRole }),
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);
            toast.success(`User role updated to ${newRole}`);
            mutate();
        } catch (err: any) {
            toast.error(err.message || "Failed to update role");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Permanently delete this user? This action cannot be undone.")) return;

        setUpdatingId(userId);
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);
            toast.success("User deleted successfully");
            mutate();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete user");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = data?.data?.filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Directory</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage user permissions and system access levels.</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                    />
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Access Level</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Joined On</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {error && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-red-500 font-bold bg-red-500/5">
                                        Synchronization Error: Unable to fetch user registry.
                                    </td>
                                </tr>
                            )}

                            {!data && (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-8 py-6">
                                            <div className="h-8 bg-white/5 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            )}

                            {filteredUsers.map((user: any) => (
                                <tr key={user._id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-black text-blue-400">{user.name[0]}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin'
                                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                                                : 'bg-white/5 text-gray-400 border border-white/10'
                                            }`}>
                                            {user.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => toggleRole(user._id, user.role)}
                                                disabled={updatingId === user._id}
                                                className={`p-2 rounded-xl transition-all border ${user.role === 'admin'
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20'
                                                    } disabled:opacity-50`}
                                                title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                            >
                                                {updatingId === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                                    user.role === 'admin' ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                disabled={updatingId === user._id}
                                                className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50"
                                                title="Remove User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && data && (
                        <div className="py-32 text-center bg-white/[0.01]">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-800">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1 tracking-tight">No candidates found</h3>
                            <p className="text-gray-500 text-xs font-medium mx-auto max-w-xs">There are no records matching your current active filters.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-3xl flex items-center justify-between gap-8 group overflow-hidden relative">
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-2">Access Control Policy</h3>
                    <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
                        Administrators have unrestricted access to all system modules including updates, queries, and resource assets.
                        User demotions are instantaneous and will restrict access upon the next session validation.
                    </p>
                </div>
                <div className="relative z-10 shrink-0">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 transition-transform group-hover:scale-110">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                </div>
            </div>
        </div>
    );
}

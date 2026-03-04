"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
    LogOut,
    LayoutDashboard,
    Rss,
    MessageSquare,
    FileText,
    Users,
    ChevronRight,
    Search
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Updates", href: "/admin/updates", icon: Rss },
    { label: "Queries", href: "/admin/queries", icon: MessageSquare },
    { label: "Resources", href: "/admin/resources", icon: FileText },
    { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
            router.push("/");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!session || session.user.role !== "admin") {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-[#111111]/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-xl font-black text-white">N</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white">Admin</h2>
                            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Management Console</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                        ? "bg-blue-600/10 text-blue-500"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto border-t border-white/5">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 overflow-hidden">
                                {session.user.image ? (
                                    <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-400">
                                        {session.user.name?.[0] || "A"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{session.user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-[1.02]"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen relative">
                {/* Top Header/Bar */}
                <header className="sticky top-0 z-40 h-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8">
                    <div className="relative w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-blue-500" />
                        <input
                            type="text"
                            placeholder="Search management items..."
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                            <span className="relative">
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </span>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}

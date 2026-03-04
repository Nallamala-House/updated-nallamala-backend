"use client";

import useSWR from "swr";
import {
    Users,
    Rss,
    MessageSquare,
    FileText,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    UsersRound
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
    const { data: stats, error } = useSWR("/api/admin/stats", fetcher);

    if (error) return (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
            Failed to load statistics. Please check if the API is working.
        </div>
    );

    if (!stats) return (
        <div className="space-y-8 animate-pulse">
            <div className="h-10 w-48 bg-white/5 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white/[0.03] rounded-2xl border border-white/5" />
                ))}
            </div>
            <div className="h-64 bg-white/[0.03] rounded-3xl border border-white/5" />
        </div>
    );

    const statCards = [
        { label: "Total Users", value: stats.data?.users || 0, icon: Users, color: "blue", trend: "+12%" },
        { label: "Updates Posted", value: stats.data?.updates || 0, icon: Rss, color: "emerald", trend: "+5%" },
        { label: "Pending Queries", value: stats.data?.queries || 0, icon: MessageSquare, color: "violet", trend: "-2%" },
        { label: "Total Resources", value: stats.data?.resources || 0, icon: FileText, color: "orange", trend: "+8%" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
                    <p className="text-gray-500 text-sm">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-2 rounded-2xl">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                        Generate Report
                    </button>
                    <button className="px-4 py-2 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
                        View Logs
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => (
                    <div key={card.label} className="group p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl bg-white/5 flex items-center justify-center`}>
                                <card.icon className={`w-6 h-6 text-white`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${card.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {card.trend}
                                {card.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{card.label}</p>
                            <h3 className="text-2xl font-black text-white">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <TrendingUp className="w-32 h-32 text-blue-500/5 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-white">System Activity</h2>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group/item">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300 leading-relaxed font-medium">
                                        <span className="text-white font-bold underline decoration-blue-500/50 decoration-2 underline-offset-4">System Status:</span> All services are running optimally. Core engine reporting 99.9% uptime for the last 24 hours.
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">Just Now</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group/item opacity-70">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        <span className="text-white font-bold">Updates:</span> Automatic backup completed successfully. All candidate records are secured.
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5 group/item opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        <span className="text-white font-bold">Queries:</span> 4 new candidate queries received and assigned to mentors.
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">5 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group min-h-[320px]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                                <UsersRound className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-4 italic truncate">PREMIUM<br />CONSOLE</h2>
                            <p className="text-blue-100 text-sm leading-relaxed mb-8">
                                Manage your community with enhanced tools and analytics tailored for growth.
                            </p>
                        </div>
                        <button className="relative z-10 w-full py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-black/20">
                            Explore Tools
                        </button>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between gap-4 group cursor-pointer hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Resources</p>
                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Library Access</p>
                            </div>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                </div>
            </div>
        </div>
    );
}

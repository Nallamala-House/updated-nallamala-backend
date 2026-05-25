"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
    Plus,
    FileText,
    Link as LinkIcon,
    Video,
    FileUp,
    Loader2,
    Trash2,
    ExternalLink,
    Download,
    Search,
    Filter
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ResourcesAdmin() {
    const { data, error, mutate } = useSWR("/api/resources", fetcher);

    const [title, setTitle] = useState("");
    const [type, setType] = useState("link");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Section specific states
    const [section, setSection] = useState("documents");
    
    // Notes fields
    const [stream, setStream] = useState("Data Science");
    const [level, setLevel] = useState("Foundation");
    const [subject, setSubject] = useState("");
    const [resourceType, setResourceType] = useState("notes");
    
    // PYQs fields
    const [streamLevel, setStreamLevel] = useState("Data Science - Foundation");
    const [year, setYear] = useState("All Years");
    const [term, setTerm] = useState("All Terms");
    const [examType, setExamType] = useState("All Exams");
    
    // Documents fields
    const [subCategory, setSubCategory] = useState("academic");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("type", type);
            formData.append("description", description);
            formData.append("section", section);

            if (section === "notes") {
                formData.append("stream", stream);
                formData.append("level", level);
                formData.append("subject", subject);
                formData.append("resourceType", resourceType);
            } else if (section === "pyqs") {
                formData.append("streamLevel", streamLevel);
                formData.append("year", year);
                formData.append("term", term);
                formData.append("examType", examType);
                formData.append("subject", subject);
            } else if (section === "documents") {
                formData.append("subCategory", subCategory);
            }

            if (type === "link") {
                if (!urlInput) throw new Error("URL is required for links.");
                formData.append("url", urlInput);
            } else if (file) {
                formData.append("file", file);
            } else if (urlInput) {
                formData.append("url", urlInput);
            } else {
                throw new Error("A file or external URL must be provided.");
            }

            const res = await fetch("/api/resources", {
                method: "POST",
                body: formData,
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            toast.success("Resource added to library!");
            setTitle("");
            setDescription("");
            setType("link");
            setFile(null);
            setUrlInput("");
            setSection("documents");
            setSubject("");
            setStream("Data Science");
            setLevel("Foundation");
            setResourceType("notes");
            setStreamLevel("Data Science - Foundation");
            setYear("All Years");
            setTerm("All Terms");
            setExamType("All Exams");
            setSubCategory("academic");
            setShowForm(false);
            mutate();
        } catch (err: any) {
            toast.error(err.message || "Failed to add resource");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        try {
            const res = await fetch(`/api/resources?id=${id}`, { method: "DELETE" });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            toast.success("Resource removed.");
            mutate();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete.");
        }
    }

    const filteredResources = data?.data?.filter((r: any) =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Resource Library</h1>
                    <p className="text-gray-500 text-sm font-medium">Curate materials, videos, and useful links for candidates.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    {showForm ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Add New Resource"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-in zoom-in-95 duration-300 shadow-2xl shadow-blue-500/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-blue-500" />
                        Upload Resource
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                    placeholder="E.g., Week 1 Study Material"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        setFile(null);
                                        setUrlInput("");
                                    }}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="link" className="bg-[#111]">External Link</option>
                                    <option value="pdf" className="bg-[#111]">PDF Document</option>
                                    <option value="video" className="bg-[#111]">Video Recording</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Section</label>
                                <select
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="documents" className="bg-[#111]">Documents (Official)</option>
                                    <option value="notes" className="bg-[#111]">Notes / Books</option>
                                    <option value="pyqs" className="bg-[#111]">PYQs (Exam Papers)</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes Conditional Fields */}
                        {section === "notes" && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Stream</label>
                                    <select
                                        value={stream}
                                        onChange={(e) => setStream(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="Data Science" className="bg-[#111]">Data Science</option>
                                        <option value="Electronics" className="bg-[#111]">Electronics</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Level</label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="Foundation" className="bg-[#111]">Foundation</option>
                                        <option value="Diploma" className="bg-[#111]">Diploma</option>
                                        <option value="Degree" className="bg-[#111]">Degree</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Resource Type</label>
                                    <select
                                        value={resourceType}
                                        onChange={(e) => setResourceType(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="notes" className="bg-[#111]">Notes</option>
                                        <option value="books" className="bg-[#111]">Books</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject / Course</label>
                                    <input
                                        type="text"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-700"
                                        placeholder="E.g., Python Programming"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PYQs Conditional Fields */}
                        {section === "pyqs" && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Program</label>
                                    <select
                                        value={streamLevel}
                                        onChange={(e) => setStreamLevel(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="Data Science - Foundation" className="bg-[#111]">Data Science - Foundation</option>
                                        <option value="Data Science - Diploma" className="bg-[#111]">Data Science - Diploma</option>
                                        <option value="Data Science - Degree" className="bg-[#111]">Data Science - Degree</option>
                                        <option value="Electronics - Degree" className="bg-[#111]">Electronics - Degree</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Year</label>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="All Years" className="bg-[#111]">All Years</option>
                                        <option value="2026" className="bg-[#111]">2026</option>
                                        <option value="2025" className="bg-[#111]">2025</option>
                                        <option value="2024" className="bg-[#111]">2024</option>
                                        <option value="2023" className="bg-[#111]">2023</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Term</label>
                                    <select
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="All Terms" className="bg-[#111]">All Terms</option>
                                        <option value="Term 1" className="bg-[#111]">Term 1</option>
                                        <option value="Term 2" className="bg-[#111]">Term 2</option>
                                        <option value="Term 3" className="bg-[#111]">Term 3</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Exam Type</label>
                                    <select
                                        value={examType}
                                        onChange={(e) => setExamType(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="All Exams" className="bg-[#111]">All Exams</option>
                                        <option value="Quiz 1" className="bg-[#111]">Quiz 1</option>
                                        <option value="Quiz 2" className="bg-[#111]">Quiz 2</option>
                                        <option value="End Term" className="bg-[#111]">End Term</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-700"
                                        placeholder="E.g., Mathematics 1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Documents Conditional Fields */}
                        {section === "documents" && (
                            <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Sub-category</label>
                                    <select
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                                    >
                                        <option value="academic" className="bg-[#111]">Academic Documents</option>
                                        <option value="policies" className="bg-[#111]">House Policies</option>
                                        <option value="programs" className="bg-[#111]">Program Details</option>
                                        <option value="transfers" className="bg-[#111]">Credit Transfers</option>
                                        <option value="opportunities" className="bg-[#111]">Opportunities / TAships</option>
                                        <option value="resources" className="bg-[#111]">General Resources</option>
                                        <option value="latest uploads" className="bg-[#111]">Latest Uploads</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            {type === "link" ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Destination URL</label>
                                    <input
                                        type="url"
                                        required
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                        placeholder="https://example.com/resource"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">File Attachment (Cloudinary)</label>
                                    <div className="relative group/file">
                                        <input
                                            type="file"
                                            required={!urlInput}
                                            accept={type === "pdf" ? "application/pdf" : "video/*"}
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    setFile(e.target.files[0]);
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full bg-white/[0.03] border border-white/5 group-hover/file:border-blue-500/30 rounded-2xl p-4 text-gray-500 flex items-center justify-between transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/5 rounded-lg text-blue-500">
                                                    {type === 'pdf' ? <FileText className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                                </div>
                                                <span className="text-sm">
                                                    {file ? file.name : `Select ${type.toUpperCase()} file...`}
                                                </span>
                                            </div>
                                            {!file && <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Browse</span>}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-center text-gray-600 font-medium">Files are stored securely as binary data in the cluster.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Resource Description</label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700 resize-none"
                                placeholder="Brief overview of what this resource contains..."
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {loading ? "Adding..." : "Add to Library"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-blue-500/30" />
                        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Stored Assets</h2>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Filter by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/[0.02] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-all w-full md:w-64"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-center font-bold">
                        Library synchronization failed.
                    </div>
                )}

                {!data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                )}

                {data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map((resource: any) => (
                            <div key={resource._id} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-3xl p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2.5 rounded-xl bg-white/5 transition-colors group-hover:bg-white/10`}>
                                            {resource.type === 'pdf' ? <FileText className="w-5 h-5 text-rose-500" /> :
                                                resource.type === 'video' ? <Video className="w-5 h-5 text-blue-500" /> :
                                                    <LinkIcon className="w-5 h-5 text-emerald-500" />}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(resource._id)}
                                            className="p-2 text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="text-white font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">{resource.title}</h3>
                                    
                                    <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                            {resource.section || "documents"}
                                        </span>
                                        {resource.section === "notes" && (
                                            <>
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    {resource.stream} • {resource.level}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">
                                                    {resource.subject}
                                                </span>
                                            </>
                                        )}
                                        {resource.section === "pyqs" && (
                                            <>
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                                                    {resource.streamLevel}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                                                    {resource.year} • {resource.term} • {resource.examType}
                                                </span>
                                            </>
                                        )}
                                        {resource.section === "documents" && resource.subCategory && (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded border border-gray-500/20">
                                                {resource.subCategory}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-6">
                                        {resource.description || "No description provided."}
                                    </p>
                                </div>

                                <a
                                    href={resource.fileId ? `/api/files/${resource.fileId._id || resource.fileId}` : resource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.03] hover:bg-blue-600 hover:text-white border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all"
                                >
                                    {resource.fileId ? <Download className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                                    {resource.fileId ? "Download Asset" : "Open Link"}
                                </a>
                            </div>
                        ))}
                        {filteredResources.length === 0 && (
                            <div className="md:col-span-2 lg:col-span-3 py-20 text-center space-y-4 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-700">
                                    <Filter className="w-8 h-8" />
                                </div>
                                <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">No assets found in the collection.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

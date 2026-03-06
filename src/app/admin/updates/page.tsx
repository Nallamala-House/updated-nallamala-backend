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
    FileText,
    Pencil
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UpdatesAdmin() {
    const { data, error, mutate } = useSWR("/api/updates", fetcher);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [badgeText, setBadgeText] = useState("Update");
    const [statusText, setStatusText] = useState("");
    const [secondaryTitle, setSecondaryTitle] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [buttonLink, setButtonLink] = useState("");
    const [links, setLinks] = useState<{ text: string; url: string }[]>([]);
    const [additionalImages, setAdditionalImages] = useState<{ file?: File; description: string; fileId?: string; tempId: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleOpenCreateForm = () => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setFile(null);
        setBadgeText("Update");
        setStatusText("");
        setSecondaryTitle("");
        setButtonText("");
        setButtonLink("");
        setLinks([]);
        setAdditionalImages([]);
        setShowForm(!showForm);
    };

    const handleOpenEditForm = (update: any) => {
        setEditingId(update._id);
        setTitle(update.title);
        setDescription(update.description);
        setFile(null);
        setBadgeText(update.badgeText || "Update");
        setStatusText(update.statusText || "");
        setSecondaryTitle(update.secondaryTitle || "");
        setButtonText(update.buttonText || "");
        setButtonLink(update.buttonLink || "");
        setLinks(update.links || []);
        setAdditionalImages(update.additionalImages?.map((img: any) => ({
            fileId: img.fileId?._id || img.fileId,
            description: img.description,
            tempId: Math.random().toString(36).substr(2, 9)
        })) || []);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const addLink = () => setLinks([...links, { text: "", url: "" }]);
    const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
    const updateLink = (index: number, field: "text" | "url", value: string) => {
        const newLinks = [...links];
        newLinks[index][field] = value;
        setLinks(newLinks);
    };

    const addImage = () => setAdditionalImages([...additionalImages, { description: "", tempId: Math.random().toString(36).substr(2, 9) }]);
    const removeImage = (index: number) => setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    const updateImageDescription = (index: number, description: string) => {
        const newImages = [...additionalImages];
        newImages[index].description = description;
        setAdditionalImages(newImages);
    };
    const updateImageFile = (index: number, file: File) => {
        const newImages = [...additionalImages];
        newImages[index].file = file;
        setAdditionalImages(newImages);
    };

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
            formData.append("badgeText", badgeText);
            formData.append("statusText", statusText);
            formData.append("secondaryTitle", secondaryTitle);
            formData.append("buttonText", buttonText);
            formData.append("buttonLink", buttonLink);
            formData.append("links", JSON.stringify(links));

            // Metadata for additional images
            const additionalImagesMetadata = additionalImages.map(img => ({
                description: img.description,
                fileId: img.fileId,
                tempId: img.tempId
            }));
            formData.append("additionalImages", JSON.stringify(additionalImagesMetadata));

            // Append actual files for new additional images
            additionalImages.forEach(img => {
                if (img.file) {
                    formData.append(`additionalFile_${img.tempId}`, img.file);
                }
            });

            const res = await fetch(editingId ? `/api/updates/${editingId}` : "/api/updates", {
                method: editingId ? "PUT" : "POST",
                body: formData,
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            toast.success(editingId ? "Update saved successfully!" : "Update published successfully!");
            setTitle("");
            setDescription("");
            setFile(null);
            setBadgeText("Update");
            setStatusText("");
            setSecondaryTitle("");
            setButtonText("");
            setButtonLink("");
            setLinks([]);
            setAdditionalImages([]);
            setShowForm(false);
            setEditingId(null);
            mutate();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this update?")) return;

        try {
            const res = await fetch(`/api/updates/${id}`, {
                method: "DELETE",
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.message);
            mutate();
            toast.success("Update deleted successfully!");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete update");
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
                    onClick={handleOpenCreateForm}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    {showForm && !editingId ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm && !editingId ? "Cancel" : "Post New Update"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl animate-in zoom-in-95 duration-300 shadow-2xl shadow-blue-500/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        {editingId ? "Edit Announcement" : "Create Announcement"}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Badge Text</label>
                                <input
                                    type="text"
                                    value={badgeText}
                                    onChange={(e) => setBadgeText(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                    placeholder="Update"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Status Text</label>
                                <input
                                    type="text"
                                    value={statusText}
                                    onChange={(e) => setStatusText(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                    placeholder="DEADLINE PASSED"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Secondary Title</label>
                                <input
                                    type="text"
                                    value={secondaryTitle}
                                    onChange={(e) => setSecondaryTitle(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                    placeholder="BS DEGREE PROGRAM"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Main Button Text</label>
                                <input
                                    type="text"
                                    value={buttonText}
                                    onChange={(e) => setButtonText(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                    placeholder="View Details"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Main Button Link (URL)</label>
                                <input
                                    type="text"
                                    value={buttonLink}
                                    onChange={(e) => setButtonLink(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Additional Links</label>
                                <button type="button" onClick={addLink} className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:underline">
                                    <Plus className="w-3 h-3" /> Add Link
                                </button>
                            </div>
                            {links.map((link, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl relative">
                                    <input
                                        type="text"
                                        placeholder="Link Text"
                                        value={link.text}
                                        onChange={(e) => updateLink(index, "text", e.target.value)}
                                        className="bg-transparent border-b border-white/10 p-2 text-white focus:outline-none text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="URL"
                                        value={link.url}
                                        onChange={(e) => updateLink(index, "url", e.target.value)}
                                        className="bg-transparent border-b border-white/10 p-2 text-white focus:outline-none text-sm"
                                    />
                                    <button type="button" onClick={() => removeLink(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Additional Images & Descriptions</label>
                                <button type="button" onClick={addImage} className="text-xs text-blue-500 font-bold flex items-center gap-1 hover:underline">
                                    <Plus className="w-3 h-3" /> Add Image
                                </button>
                            </div>
                            {additionalImages.map((img, index) => (
                                <div key={index} className="space-y-4 bg-white/5 p-4 rounded-2xl relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files.length > 0) {
                                                        updateImageFile(index, e.target.files[0]);
                                                    }
                                                }}
                                                className="text-xs text-gray-500 w-full"
                                            />
                                            {img.fileId && <span className="text-[10px] text-blue-500 font-bold uppercase">Existing Image Saved</span>}
                                        </div>
                                        <textarea
                                            placeholder="Image Description"
                                            value={img.description}
                                            onChange={(e) => updateImageDescription(index, e.target.value)}
                                            rows={2}
                                            className="bg-transparent border border-white/10 p-2 rounded-xl text-white focus:outline-none text-sm resize-none"
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Main Content Description</label>
                            <textarea
                                required
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-gray-700 resize-none"
                                placeholder="Details of the announcement..."
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setTitle("");
                                        setDescription("");
                                    }}
                                    className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all flex items-center gap-2"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? (editingId ? "Saving..." : "Publishing...") : (editingId ? "Save Changes" : "Publish Broadcast")}
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
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button
                                        onClick={() => handleOpenEditForm(update)}
                                        className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 transition-all"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(update._id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                                    >
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

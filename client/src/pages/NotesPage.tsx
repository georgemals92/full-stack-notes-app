import { ChangeEvent, FormEvent, useEffect, useState } from "react";

// Service imports
import {
    getNotes as apiGetNotes,
    createNote as apiCreateNote,
    updateNote as apiUpdateNote,
    deleteNote as apiDeleteNote,
} from "../services/noteService";
import { getTags as apiGetTags } from "../services/tagService";
import { getCategories as apiGetCategories } from "../services/categoryService";

// Import types
import { Note, NotePayload } from "../lib/note";
import { Tag } from "../lib/tag";
import { Category } from "../lib/category";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

import { FilterIcon } from "lucide-react";
import FiltersSidebar from "@/components/features/filters/FiltersSidebar";
import NoteDialog from "@/components/features/notes/NoteDialog";
import NoteCard from "@/components/features/notes/NoteCard";

function NotesPage() {
    // General state variables
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // State for master lists
    const [notes, setNotes] = useState<Note[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    // State variables for create and update notes
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null); // tracks the note being edited
    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [noteDialogOpen, setNoteDialogOpen] = useState<boolean>(false); // state for edit note modal

    //Filtering, search, sorting states
    const [filterCategories, setFilterCategories] = useState<string[]>([]);
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("createdAt"); //default as in API controller
    const [order, setOrder] = useState<string>("desc"); // default as in API controller

    // Construct query params for notes fetching
    const buildQuery = () => {
        const params = new URLSearchParams();
        filterTags.forEach((id) => params.append("tags", id));
        filterCategories.forEach((id) => params.append("categories", id));
        params.set("search", searchQuery);
        params.set("sortBy", sortBy);
        params.set("order", order);
        const q = params.toString();
        console.log(q);
        return q ? `?${q}` : "";
    };

    async function loadNotes(query = "") {
        setLoading(true);
        setError(null);
        try {
            const data: Note[] = await apiGetNotes(query);
            setNotes(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        } finally {
            setLoading(false);
            console.log(query); // For testing
        }
    }

    useEffect(() => {
        (async () => {
            try {
                const [tags, categories] = await Promise.all([
                    apiGetTags(),
                    apiGetCategories(),
                ]);
                setAllTags(tags);
                setAllCategories(categories);
            } catch (e) {
                console.warn("Failed to load tags / categories", e);
            } finally {
                loadNotes(); //loadNotes(buildQuery()); -> check
            }
        })(); //why parenthesis in the end?
    }, []);

    async function handleCreate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const created = await apiCreateNote({
                title: title.trim(),
                body,
                categories: selectedCategoryIds,
                tags: selectedTagIds,
            });
            setNotes((prev) => [created, ...prev]);
            resetEditorState();

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    }

    async function handleUpdate(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            if (!editingNoteId) return;

            // Convert comma-separated tags string into an array
            const payload: NotePayload = {
                title: title,
                body: body ?? "",
                categories: selectedCategoryIds,
                tags: selectedTagIds,
            };

            // Use same payload for the api helper so the update is consistent
            const updated = await apiUpdateNote(editingNoteId, payload);
            console.log(updated);
            setNotes((prev) =>
                prev.map((n) => (n._id === updated._id ? updated : n))
            );
            resetEditorState();

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this note?")) return;
        try {
            await apiDeleteNote(id);
            setNotes((prev) => prev.filter((n) => n._id !== id));
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(String(err));
            }
        }
    }

    function onNoteEdit(note: Note) : void {
        if (!note._id) {
            return;
        } // To guard against invalid id before setting editing state
        setNoteDialogOpen(true);
        setEditingNoteId(note._id);
        setTitle(note.title ?? "");
        setBody(note.body ?? "");
        setSelectedCategoryIds(
            Array.isArray(note.categories)
                ? note.categories.map((c) => String(c._id))
                : []
        );
        setSelectedTagIds(
            Array.isArray(note.tags)
                ? note.tags.map((t) => String(t._id))
                : []
        );
    }

    function resetEditorState() {
        setEditingNoteId(null);
        setTitle("");
        setBody("");
        setSelectedCategoryIds([]);
        setSelectedTagIds([]);
        setNoteDialogOpen(false);
    }

    function resetFilters() {
        setFilterCategories([]);
        setFilterTags([]);
        setSearchQuery("");
        setSortBy("createdAt");
        setOrder("desc");
        loadNotes();
    }

    function applyFilters() {
        loadNotes(buildQuery());
    }

    return (
        <SidebarProvider>
            <div className="flex">
                <FiltersSidebar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    allCategories={allCategories}
                    filterCategories={filterCategories}
                    setFilterCategories={setFilterCategories}
                    allTags={allTags}
                    filterTags={filterTags}
                    setFilterTags={setFilterTags}
                    order={order}
                    setOrder={setOrder}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onFiltersReset={resetFilters}
                    onFiltersApply={applyFilters}
                />

                <div className="px-12 py-2 flex flex-col gap-2">
                    <div className="flex justify-between items-center w-full mt-12 pb-3 px-3 border-b-2">
                        <h1>Notes</h1>
                        <div className="flex items-center gap-1">
                            <SidebarTrigger className="h-8 w-8">
                                <FilterIcon />
                            </SidebarTrigger>
                            <NoteDialog
                                mode={editingNoteId ? "edit" : "create"}
                                noteDialogOpen={noteDialogOpen}
                                title={title}
                                body={body}
                                allCategories={allCategories}
                                selectedCategoryIds={selectedCategoryIds}
                                allTags={allTags}
                                selectedTagIds={selectedTagIds}
                                setTitle={setTitle}
                                setBody={setBody}
                                setSelectedCategoryIds={setSelectedCategoryIds}
                                setSelectedTagIds={setSelectedTagIds}
                                setNoteDialogOpen={setNoteDialogOpen}
                                onSubmit={editingNoteId ? handleUpdate : handleCreate}
                                editingNoteId={editingNoteId}
                                setEditingNoteId={setEditingNoteId}
                            />
                        </div>
                        {loading && <p>Loading...</p>}
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                    <div className="flex flex-wrap w-full gap-3">
                        {notes.map((note) => (
                            <NoteCard 
                                note={note}
                                onEdit={onNoteEdit}
                                onDelete={handleDelete}
                            /> 
                        ))}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}

export default NotesPage;
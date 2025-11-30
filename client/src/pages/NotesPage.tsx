// Import Hooks
import { FormEvent, useEffect, useState } from "react";
import { useNoteFilters } from "@/hooks/useNoteFilters";
import { idleNoteEditor, useNoteEditor } from "@/hooks/useNoteEditor";

// Import services
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

// Import Components
import FiltersSidebar from "@/components/features/filters/FiltersSidebar";
import NoteDialog from "@/components/features/notes/NoteDialog";
import NoteCard from "@/components/features/notes/NoteCard";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

// Import icons
import { FilterIcon } from "lucide-react";

function NotesPage() {
    // Error states
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // State for master lists
    const [notes, setNotes] = useState<Note[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const { noteFilters, setNoteFilters, buildQuery, resetFilters } = useNoteFilters(); // UseNoteFilters custom hook consumption
    const { noteEditor, setNoteEditor, resetNoteEditor } = useNoteEditor();
    const [mode, setMode] = useState<"create" |"edit">();
    
    // State variables for create and update notes
    const [noteDialogOpen, setNoteDialogOpen] = useState<boolean>(false); // state for edit note modal

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
        if (!noteEditor.title.trim()) return;

        try {
            const created = await apiCreateNote({
                title: noteEditor.title.trim(),
                body: noteEditor?.body ?? "",
                categories: noteEditor?.categories ?? [],
                tags: noteEditor?.tags ?? [],
            });
            setNotes((prev) => [created, ...prev]);
            handleNoteEditorReset();

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
            if (!noteEditor.editingNoteId ) return;

            // Convert comma-separated tags string into an array
            const payload: NotePayload = {
                title: noteEditor.title,
                body: noteEditor?.body ?? "",
                categories: noteEditor?.categories ?? [],
                tags: noteEditor?.tags ?? [],
            };

            // Use same payload for the api helper so the update is consistent
            const updated = await apiUpdateNote(noteEditor.editingNoteId, payload);
            console.log(updated);
            setNotes((prev) =>
                prev.map((n) => (n._id === updated._id ? updated : n))
            );
            handleNoteEditorReset();

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
        setNoteEditor({
            editingNoteId: note._id,
            title: note.title,
            body: note.body ?? "",
            categories: Array.isArray(note.categories)
                ? note.categories.map((c) => String(c._id)) : [],
            tags: Array.isArray(note.tags)
                ? note.tags.map((t) => String(t._id)) : []
        });
    }

    function handleNoteEditorReset() {
        resetNoteEditor();
        setNoteDialogOpen(false);
    }

    function handleResetFilters() {
        resetFilters();
        loadNotes();
    }

    function handleApplyFilters() {
        loadNotes(buildQuery()); //update?
    }

    return (
        <SidebarProvider>
            <div className="flex">
                <FiltersSidebar
                    allTags={allTags}
                    allCategories={allCategories}
                    noteFilters={noteFilters}
                    setNoteFilters={setNoteFilters}
                    onFiltersReset={handleResetFilters}
                    onFiltersApply={handleApplyFilters}
                />

                <div className="px-12 py-2 flex flex-col gap-2">
                    <div className="flex justify-between items-center w-full mt-12 pb-3 px-3 border-b-2">
                        <h1>Notes</h1>
                        <div className="flex items-center gap-1">
                            <SidebarTrigger className="h-8 w-8">
                                <FilterIcon />
                            </SidebarTrigger>
                            <NoteDialog
                                allCategories={allCategories}
                                allTags={allTags}
                                noteDialogOpen={noteDialogOpen}
                                setNoteDialogOpen={setNoteDialogOpen}
                                mode={noteEditor.editingNoteId ? "edit" : "create"}
                                noteEditor={noteEditor}
                                setNoteEditor={setNoteEditor}
                                onSubmit={noteEditor.editingNoteId ? handleUpdate : handleCreate}
                            />
                        </div>
                        {loading && <p>Loading...</p>}
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                    <div className="flex flex-wrap w-full gap-3">
                        {notes.map((note) => (
                            <NoteCard 
                                key={note._id}
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
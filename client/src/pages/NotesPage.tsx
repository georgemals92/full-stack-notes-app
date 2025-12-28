// Import Hooks
import { FormEvent, useEffect, useState } from "react";
import { useNoteFilters } from "@/hooks/useNoteFilters";
import { useNoteEditor } from "@/hooks/useNoteEditor";

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

// Import Layouts & Components
import PageLayout from "@/components/layouts/PageLayout";
import FiltersSidebar from "@/components/features/filters/FiltersSidebar";
import NoteDialog from "@/components/features/notes/NoteDialog";
import NoteCard from "@/components/features/notes/NoteCard";

// Import icons
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LogOut, Notebook, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function NotesPage() {
  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const { noteFilters, setNoteFilters, buildQuery, resetFilters } =
    useNoteFilters(); // UseNoteFilters custom hook consumption
  const {
    noteEditor,
    setNoteEditor,
    noteDialogOpen,
    setNoteDialogOpen,
    onNoteCreateStart,
    onNoteEditorReset,
    onNoteEditorStart,
  } = useNoteEditor();

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
      setTimeout(() => {
        setLoading(false);
      }, 275); //For testing
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
    })(); // Async function to invoked immediately after effect runs (parentheses at the end)
  }, []); // Check dependency array - filter change should trigger re-renders, ...

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
      toast.success("Note was successfully created.");
      onNoteEditorReset();
      handleResetFilters();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error("An error occured during the note creation.");
      } else {
        setError(String(err));
        toast.error("An error occured during the note creation.");
      }
    }
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (!noteEditor.editingNoteId) return;

      // Convert comma-separated tags string into an array
      const payload: NotePayload = {
        title: noteEditor.title,
        body: noteEditor?.body ?? "",
        categories: noteEditor?.categories ?? [],
        tags: noteEditor?.tags ?? [],
      };

      // Use same payload for the api helper so the update is consistent
      const updated = await apiUpdateNote(noteEditor.editingNoteId, payload);
      onNoteEditorReset();
      handleApplyFilters();
      toast.success("Note was successfully updated.");
      console.log(updated);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error("An error occured during the note update.");
      } else {
        setError(String(err));
        toast.error("An error occured during the note update.");
      }
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDeleteNote(id);
      handleApplyFilters();
      toast.success("Note was successfully deleted.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error("An error occured during the note deletion.");
      } else {
        setError(String(err));
        toast.error("An error occured during the note deletion.");
      }
    }
  }

  function handleResetFilters() {
    resetFilters();
    loadNotes();
  }

  function handleApplyFilters() {
    loadNotes(buildQuery()); //update?
  }

  const { logout } = useAuth();

  const header = (
    <>
      <Button variant="default" size="default" onClick={onNoteCreateStart}>
        <Plus />
        Create note
      </Button>
      <Button variant="secondary" onClick={logout}>
        <LogOut />
        Logout
      </Button>
    </>
  );

  const sidebar = (
    <FiltersSidebar
      allTags={allTags}
      allCategories={allCategories}
      noteFilters={noteFilters}
      setNoteFilters={setNoteFilters}
      onFiltersReset={handleResetFilters}
      onFiltersApply={handleApplyFilters}
    />
  );

  const skeletonList = loading
    ? Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex flex-col space-y-3 gap-4">
          <Skeleton className="h-65 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))
    : null;

  const emptyState = notes.length === 0 && (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Notebook className="size-20" />
        </EmptyMedia>
        <EmptyTitle>No notes match your search!</EmptyTitle>
        <EmptyDescription>
          Create a new note or reset your search.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex flex-row justify-center w-full gap-3">
        <Button variant="default" size="default" onClick={onNoteCreateStart}>
          Create note
        </Button>
        <Button variant="outline" size="default" onClick={handleResetFilters}>
          Reset filters
        </Button>
      </EmptyContent>
    </Empty>
  );

  const pageContent =
    notes.length > 0 &&
    notes.map((note) => (
      <NoteCard
        key={note._id}
        note={note}
        onEdit={onNoteEditorStart}
        onDelete={handleDelete}
      />
    ));

  return (
    <>
      <PageLayout
        sidebar={sidebar}
        title="Notes"
        header={header}
        empty={emptyState}
        pageContent={pageContent}
        loading={skeletonList}
      ></PageLayout>
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
    </>
  );
}

export default NotesPage;

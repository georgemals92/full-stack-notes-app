import { Note } from "@/lib/note";
import { useState } from "react";

export type NoteEditorState = 
    {
        editingNoteId: string | null;
        title: string;
        body: string;
        categories: string[];
        tags: string[];
    };

export const idleNoteEditor : NoteEditorState = {
        editingNoteId: null,
        title: "",
        body: "",
        categories: [],
        tags: []
}

export function useNoteEditor() {
    const [ noteEditor, setNoteEditor ] = useState<NoteEditorState>(idleNoteEditor);
    const [noteDialogOpen, setNoteDialogOpen] = useState<boolean>(false);

    function onNoteEditorReset() {
            setNoteEditor(idleNoteEditor);
            setNoteDialogOpen(false);
        }

    function onNoteEditorStart(note: Note) : void {
        if (!note._id) {
            return;
        } // To guard against invalid id before setting editing state
        setNoteEditor({
            editingNoteId: note._id,
            title: note.title,
            body: note.body ?? "",
            categories: Array.isArray(note.categories)
                ? note.categories.map((c) => String(c._id)) : [],
            tags: Array.isArray(note.tags)
                ? note.tags.map((t) => String(t._id)) : []
        });
        setNoteDialogOpen(true);
    }
        function onNoteCreateStart() : void {
        setNoteEditor(idleNoteEditor);
        setNoteDialogOpen(true);
    }

    return {
        noteEditor,
        setNoteEditor,
        onNoteEditorReset,
        onNoteEditorStart,
        onNoteCreateStart,
        noteDialogOpen,
        setNoteDialogOpen,
    };
}
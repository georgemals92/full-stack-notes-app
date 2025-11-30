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

    function resetNoteEditor() {
            setNoteEditor(idleNoteEditor);
        }

    return {
        noteEditor,
        setNoteEditor,
        resetNoteEditor
    };
}
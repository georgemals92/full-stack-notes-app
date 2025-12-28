import { Note, NotePayload } from "../lib/note";
import { authHeader } from "./authService";

const API_BASE = "/api/notes";

export async function getNotes(query: string): Promise<Note[]> {
  const res = await fetch(`${API_BASE}${query}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return await res.json();
}

export async function createNote(note: NotePayload): Promise<Note> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(note),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to create note");
  }

  return await res.json();
}

export async function updateNote(id: string, note: NotePayload): Promise<Note> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(note),
  });

  if (!res.ok) throw new Error("Failed to update note");

  return await res.json();
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error("Failed to delete note");
}

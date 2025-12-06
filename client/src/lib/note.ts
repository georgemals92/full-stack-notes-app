import { Category } from "./category";
import { Tag } from "./tag";

export interface Note {
    _id: string,
    title: string,
    body?: string,
    categories?: Category[],
    tags?: Tag[],
    createdAt: string
}

export type NotePayload = {
    title: string,
    body?: string,
    categories?: string[],
    tags?: string[]
}

export type EditDraft = NotePayload & {_id : string};

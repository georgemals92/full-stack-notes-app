import { useState } from "react";

// Note filter state interface declaration 
export interface NoteFilterState {
    categories: string[];
    tags: string[];
    search: string;
    sortBy: string;
    order: string;
}

// Default values for note filters
const defaultNoteFilters: NoteFilterState = {
    categories: [],
    tags: [],
    search: "",
    sortBy: "createdAt",
    order: "desc"
}

// Custom hook for notes filter state management
export function useNoteFilters() {
    const [noteFilters, setNoteFilters] = useState<NoteFilterState>(defaultNoteFilters);

    // Helper to update a single field - TOCHECK
    
    // const updateFilter = <K extends keyof NoteFilterState>(
    //     field: K,
    //     value: NoteFilterState[K]
    // ) => {
    //     setNoteFilters((prev) => ({ ...prev, [field]: value }));
    // };

    // Function to construct query based on note filter values 
    const buildQuery = () => {
        const params = new URLSearchParams();
        noteFilters.tags.forEach((id) => params.append("tags", id));
        noteFilters.categories.forEach((id) => params.append("categories", id));
        params.set("search", noteFilters.search);
        params.set("sortBy", noteFilters.sortBy);
        params.set("order", noteFilters.order);
        const q = params.toString();
        console.log(q);
        return `?${q}` || "";
    };

    function resetFilters() {
        setNoteFilters(defaultNoteFilters);
    }

    return {
        noteFilters,
        setNoteFilters,
        buildQuery,
        resetFilters
    };

}
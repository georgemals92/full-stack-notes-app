import { Tag } from "../lib/tag";

const API_BASE = '/api/tags';

export async function getTags() : Promise<Tag[]> {
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error('Failed to fetch tags');
      return await res.json();
    } 
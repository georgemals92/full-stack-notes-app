import { Category } from "../lib/category";

const API_BASE = '/api/categories';

export async function getCategories() : Promise<Category[]> {
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } 
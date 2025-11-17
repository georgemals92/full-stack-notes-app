const API_BASE = '/api/categories';

export async function getCategories() {
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } 
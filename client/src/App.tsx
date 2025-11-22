// Imports
import './App.css'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Button } from './components/ui/button';

// Service imports
import { getNotes as apiGetNotes,
         createNote as apiCreateNote,
         updateNote as apiUpdateNote,
         deleteNote as apiDeleteNote
} from './services/noteService';
import { getTags as apiGetTags } from './services/tagService';
import { getCategories as apiGetCategories} from './services/categoryService'; 

// Import types
import { EditDraft, Note, NotePayload } from './lib/note';
import { Tag } from './lib/tag';
import { Category } from './lib/category';

function App() {
  // General state variables
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for master lists
  const [notes , setNotes] = useState<Note[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // State variables for create and update notes
  const [title, setTitle] = useState<string>('');
  const [body, setBody] = useState<string>('');
  
  // States for tags and category IDs in create and update note?
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // States for ?????
  const [editSelectedTagIds, setEditSelectedTagIds] = useState<string[]>([]);
  const [editSelectedCategoryIds, setEditSelectedCategoryIds] = useState<string[]>([]);

  // State for note selected to edit
  const [editingNote, setEditingNote] = useState<EditDraft | null>(null); // tracks the note being edited
  
  //Filtering, search, sorting states
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt'); //default as in API controller
  const [order, setOrder] = useState<string>('desc'); // default as in API controller 

  // Construct query params for notes fetching
  const buildQuery = () => {
    const params = new URLSearchParams();
    filterTags.forEach(id => params.append('tags', id));
    filterCategories.forEach(id => params.append('categories', id));
    params.set('search', searchQuery);
    params.set('sortBy', sortBy);
    params.set('order', order);
    const q = params.toString();
    console.log(q);
    return q ? `?${q}` : '';
  } 

  // Helper function to read selected values from <select multiple>
  const getSelectedValues = (e: ChangeEvent<HTMLSelectElement>) => {
    return Array.from(e.target.selectedOptions, o => o.value);
  }

  async function loadNotes(query = '') {
    setLoading(true);
    setError(null);
    try {
      const data : Note[]= await apiGetNotes(query);
      setNotes(data);
    } catch (err : unknown) {
      if (err instanceof Error){
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
    ( async () => {
      try {
        const [tags, categories] = await Promise.all([apiGetTags(), apiGetCategories()]);
        setAllTags(tags);
        setAllCategories(categories);
      } catch (e) {
        console.warn('Failed to load tags / categories', e);
      } finally {
        loadNotes(); //loadNotes(buildQuery()); -> check
      }
    })() //why parenthesis in the end?
  }, []);

  async function handleCreate(e : FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      const created = await apiCreateNote({ 
        title: title.trim(),
        body,
        categories: selectedCategoryIds,
        tags: selectedTagIds
      }); 
      setNotes(prev => [created, ...prev]);
      setTitle(''); 
      setBody('');
      setSelectedCategoryIds([]);
      setSelectedTagIds([]);
    
    } catch (err : unknown) {
      if (err instanceof Error){
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  }
  
  async function handleUpdate(e : FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (!editingNote) return;
      
      // Convert comma-separated tags string into an array
      const payload : NotePayload = {
        title: editingNote.title ,
        body: editingNote?.body ?? '',
        categories: editSelectedCategoryIds,
        tags: editSelectedTagIds
      };

      // Use same payload for the api helper so the update is consistent
      const updated = await apiUpdateNote(editingNote._id, payload);
      
      setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
      setEditingNote(null);
      setTitle(''); 
      setBody('');
      setEditSelectedCategoryIds([]);
      setEditSelectedTagIds([]);
      setSelectedCategoryIds([]);
      setSelectedTagIds([]);
    
    } catch (err : unknown) {
      if (err instanceof Error){
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  }

  async function handleDelete(id : string) {
    if (!confirm('Delete this note?')) return;
    try {
      await apiDeleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err : unknown) {
      if (err instanceof Error){
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
  }

  return (
    <div style={{ minWidth: 500, maxWidth: 800, margin: '2rem auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Notes</h1>
      {/* Filters, Sorting & Search */}
      <h3 style={{textAlign:'left'}}>Filters & Search</h3>
      <div style={{display: 'flex', flexWrap:'wrap', alignItems: 'center', height: '2rem', marginBottom: '0.5rem', gap:'4px', width: '100%', minWidth: 500, boxSizing: 'border-box'}}>
        <input
          placeholder="Search..."
          value={searchQuery}
          style={{height: '100%', boxSizing: 'border-box'}}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <select
          multiple
          title="Filter by Category"
          value={filterCategories}
          style={{height: '100%', boxSizing: 'border-box'}}
          onChange={e => setFilterCategories(getSelectedValues(e))}
        >
          {allCategories.map((c)=>{
            return <option key={c._id} value={c._id}>{c.name}</option>;
          })}
        </select>

        <select
          multiple
          title="Filter by Tag"
          value={filterTags}
          style={{height: '100%', boxSizing: 'border-box'}}
          onChange={e => setFilterTags(getSelectedValues(e))}
        >
          {allTags.map((t)=>{
            return <option key={t._id} value={t._id}>{t.name}</option>;
          })}
        </select>

        <select 
          value={sortBy} 
          style={{height: '100%', boxSizing: 'border-box'}}
          onChange={e => setSortBy(e.target.value)}>
          <option value="createdAt">Created Date</option>
          <option value="title">Title</option>
        </select>

        <select 
          value={order} 
          style={{height: '100%', boxSizing: 'border-box'}}
          onChange={e => setOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <Button variant="destructive" onClick={() => loadNotes(buildQuery())}>Apply</Button>
      </div>

      <h3 style={{textAlign:'left'}}>Create note</h3>
      {/* Create new note form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '1rem', width: '100%'}}>
        <div>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ marginBottom: '0.5rem', padding: '0.5rem', width: '100%', minWidth: 500, boxSizing: 'border-box' }}
            required
          />
        </div>
        <div>
          <label htmlFor="categories-select" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Categories (multiple selection)
          </label>
          <select
          multiple
          id = "categories-select"
          value={selectedCategoryIds}
          style={{height: '100%', minWidth:140, boxSizing: 'border-box'}}
          onChange={e => setSelectedCategoryIds(getSelectedValues(e))}
          >
            {allCategories.map((c)=>{
              return <option key={c._id} value={c._id}>{c.name}</option>;
            })}
          </select>
        </div>
        <div>
          <label htmlFor="tags-select" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Tags (multiple selection)
          </label>
          <select
            multiple
            id = "tags-select"
            value={selectedTagIds}
            style={{height: '100%', minWidth:140, boxSizing: 'border-box'}}
            onChange={e => setSelectedTagIds(getSelectedValues(e))}
          >
            {allTags.map((t)=>{
              return <option key={t._id} value={t._id}>{t.name}</option>;
            })}
          </select>
          
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <textarea
            placeholder="Body (optional)"
            value={body}
            onChange={e => setBody(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', minHeight: 80, boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}>
          Create
        </button>
      </form>

      <h3 style={{textAlign:'left'}}>My notes</h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map(note => (
          
          <li key={note._id} style={{
            border: '1px solid #ddd',
            padding: '0.75rem',
            marginBottom: '0.5rem',
            borderRadius: '8px'
          }}>
            {/* Inline form to update the note */}
            {editingNote && editingNote._id === note._id ? (
              <form onSubmit={handleUpdate}>
                <input
                  value={editingNote?.title ?? ''}
                  onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.25rem' }}
                />
                <select
                  multiple
                  title="Categories (multiple selection)"
                  value={editSelectedCategoryIds}
                  style={{height: '100%', minWidth:140, boxSizing: 'border-box'}}
                  onChange={e => setEditSelectedCategoryIds(getSelectedValues(e))}
                >
                  {allCategories.map((c)=>{
                    return <option key={c._id} value={c._id}>{c.name}</option>;
                  })}
                </select>
                <select
                  multiple
                  title="Tags (multiple selection)"
                  value={editSelectedTagIds}
                  style={{height: '100%', minWidth:140, boxSizing: 'border-box'}}
                  onChange={e => setEditSelectedTagIds(getSelectedValues(e))}
                >
                  {allTags.map((t)=>{
                    return <option key={t._id} value={t._id}>{t.name}</option>;
                  })}
                </select>
                <textarea
                  value={editingNote?.body ?? ''}
                  onChange={e => setEditingNote({ ...editingNote, body: e.target.value })}
                  style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }}
                />
                <button type="submit" style={{ marginTop: 6 }}>Save</button>
                <button type="button" onClick={() => {
                  setEditingNote(null);
                  setEditSelectedCategoryIds([]);
                  setEditSelectedTagIds([]);
                  setSelectedCategoryIds([]);
                  setSelectedTagIds([]);
                  }} style={{ marginLeft: 6 }}>Cancel</button>
              </form>
            ) : (
              // Note display when not being updated
              <>
                <strong>{note.title}</strong>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                  {/* Converts date to date object and handles format */}
                  {new Date(note.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: 14, marginTop: 6 }}>
                  {/* Destructures category array elements */}
                  {Array.isArray(note.categories) ? note.categories.map(
                      (c, id) => <span key={id} style={{margin: '0.25rem', padding: 4, backgroundColor:'#f2f2f2', color: '#242424', borderRadius: 4}}>{c.name}</span>) 
                    : note.categories
                  }
                </div>
                <div style={{ fontSize: 14, marginTop: 6 }}>
                  {/* Destructures tag array elements */}
                  {Array.isArray(note.tags) ? note.tags.map(
                    (t, id) => <span key={id} style={{margin: '0.25rem', padding: 4, backgroundColor:'#f2f2f2', color: '#242424', borderRadius: 4}}>{t.name}</span>) 
                    : note.tags
                  }
                </div>
                <div style={{ fontSize: 14, marginTop: 6 }}>{note.body}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => {
                    setEditingNote({_id: note._id, title: note.title, body: note.body});
                    setEditSelectedCategoryIds(Array.isArray(note.categories) ? note.categories.map(c => String(c._id)) : []);
                    setEditSelectedTagIds(Array.isArray(note.tags) ? note.tags.map(t => String(t._id)) : []);
                    }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(note._id)} style={{ marginLeft: 8 }}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}


export default App;
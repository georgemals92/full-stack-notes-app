// Imports
import './App.css'
import { useEffect, useState } from 'react';
import { getNotes as apiGetNotes,
         createNote as apiCreateNote,
         updateNote as apiUpdateNote,
         deleteNote as apiDeleteNote
} from './services/noteService';

function App() {
  // State variables
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(null); // tracks the note being edited
  
  //Filtering, search, sorting states
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); //default as in API controller
  const [order, setOrder] = useState('desc'); // default as in API controller 

  // Construct query params for notes fetching
  let query = '?';
  if (filterTag) {query += `tag=${filterTag}&`};
  if (filterCategory) {query += `category=${filterCategory}&`};
  if (searchQuery) {query += `search=${searchQuery}&`};
  query += `sortBy=${sortBy}&order=${order}`;  

  async function loadNotes(query = '') {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetNotes(query);
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      console.log(query); // For testing
    }
  }

  useEffect(() => { loadNotes(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      const created = await apiCreateNote({ 
        title: title.trim(),
        body,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      }); 
      setNotes(prev => [created, ...prev]);
      setTitle(''); 
      setBody('');
      setCategory('');
      setTags('');
    
    } catch (err) {
      setError(err.message);
    }
  }
  
  async function handleUpdate(e) {
    e.preventDefault();
    try {
      // Convert comma-separated tags string into an array
      const tagsArray = (editingNote.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        title: editingNote.title,
        body: editingNote.body,
        category: editingNote.category,
        tags: tagsArray
      };

      const res = await fetch(`/api/notes/${editingNote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update');
      
      // Use same payload for the api helper so the update is consistent
      const updated = await apiUpdateNote(editingNote._id, payload);
      
      setNotes(prev => prev.map(n => n._id === updated._id ? updated : n));
      setEditingNote(null);
      setTitle(''); 
      setBody('');
      setCategory('');
      setTags('');
    
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return;
    try {
      await apiDeleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      setError(err.message);
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

        <input
          placeholder="Filter by Category"
          value={filterCategory}
          style={{height: '100%', boxSizing: 'border-box'}}
          onChange={e => setFilterCategory(e.target.value)}
        />

        <input
          placeholder="Filter by Tag"
          value={filterTag}
          style={{height: '100%', boxSizing: 'border-box'}}
          onChange={e => setFilterTag(e.target.value)}
        />

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

        <button onClick={() => loadNotes(query)} style={{height: '100%', width:'62px', boxSizing: 'border-box', padding:0}}>Apply</button>
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
          <input
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ marginBottom: '0.5rem', padding: '0.5rem', width: '100%', minWidth: 500, boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', minWidth: 500, boxSizing: 'border-box' }}
          />
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
                  value={editingNote.title}
                  onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.25rem' }}
                />
                <input
                  placeholder="Category"
                  value={editingNote.category}
                  onChange={e => setEditingNote({ ...editingNote, category: e.target.value})}
                  style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }}
                />
                <input
                  placeholder="Tags (comma separated)"
                  value={editingNote.tags}
                  onChange={e => setEditingNote({ ...editingNote, tags: e.target.value })}
                  style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }}
                />
                <textarea
                  value={editingNote.body}
                  onChange={e => setEditingNote({ ...editingNote, body: e.target.value })}
                  style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }}
                />
                <button type="submit" style={{ marginTop: 6 }}>Save</button>
                <button type="button" onClick={() => setEditingNote(null)} style={{ marginLeft: 6 }}>Cancel</button>
              </form>
            ) : (
              // Note display when not being updated
              <>
                <strong>{note.title}</strong>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                  {/* Converts date to date object and handles format */}
                  {new Date(note.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: 14, marginTop: 6 }}>{note.category}</div>
                <div style={{ fontSize: 14, marginTop: 6 }}>
                  {/* Destructures tag array elements */}
                  {Array.isArray(note.tags) ? note.tags.map(t => <span style={{margin: '0.25rem', padding: 4, backgroundColor:'#f2f2f2', color: '#242424', borderRadius: 4}}>{t}</span>) : note.tags}
                </div>
                <div style={{ fontSize: 14, marginTop: 6 }}>{note.body}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => setEditingNote({
                    ...note,
                    // Ensures tags show up as a comma-separated string in the edit input
                    tags: Array.isArray(note.tags) ? note.tags.join(', ') : (note.tags || '')
                  })}>Edit</button>
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
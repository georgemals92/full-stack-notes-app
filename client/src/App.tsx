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
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Input } from './components/ui/input';
import { Checkbox } from './components/ui/checkbox';
import { Label } from './components/ui/label';
import { ScrollArea, ScrollBar } from './components/ui/scroll-area';
import { Textarea } from './components/ui/textarea';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Filter, FilterIcon, Pen, Trash } from 'lucide-react';
 

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
    <SidebarProvider>
      <div className='flex'>
        
        {/* Filters, Sorting & Search */}
        <Sidebar>
          <SidebarHeader>
            <h3>Filters & Search</h3>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Search</SidebarGroupLabel>
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} //Standard HTML event listener
                >
                </Input>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Filter by Category</SidebarGroupLabel>
                <ScrollArea className='max-h-40 overflow-y-auto'>
                  {allCategories.map((c)=>
                    (
                    <div key={c._id} className='flex items-center gap-2 h-8'>
                      <Checkbox 
                        id={`cat-${c._id}`}
                        checked={filterCategories.includes(c._id)}
                        onCheckedChange={(checked) => {
                          if(checked) {
                            setFilterCategories([...filterCategories, c._id]);
                          } else {
                            setFilterCategories(filterCategories.filter(id => id !== c._id));
                          }
                        }}
                      />
                      <Label className="cursor-pointer font-normal" htmlFor={`cat-${c._id}`}>
                        {c.name}
                      </Label>
                    </div>))
                  }
                </ScrollArea>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Filter by Tag</SidebarGroupLabel>
                <ScrollArea className='max-h-40 overflow-y-auto'>
                    {allTags.map((t)=>
                      (
                      <div key={t._id} className='flex items-center gap-2 h-8'>
                        <Checkbox 
                          id={`tag-${t._id}`}
                          checked={filterTags.includes(t._id)}
                          onCheckedChange={(checked) => {
                            if(checked) {
                              setFilterTags([...filterTags, t._id]);
                            } else {
                              setFilterTags(filterTags.filter(id => id !== t._id));
                            }
                          }}
                        />
                        <Label htmlFor={`tag-${t._id}`} className="cursor-pointer font-normal">
                          {t.name}
                        </Label>
                      </div>))
                    }
                </ScrollArea> 
              </SidebarGroup>
              <SidebarGroup className='w-full'>
                <SidebarGroupLabel>Sort</SidebarGroupLabel>
                <Select 
                  value={sortBy} 
                  onValueChange={setSortBy}>
                  <SelectTrigger className='w-full my-1.5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={order} 
                  onValueChange={setOrder}>
                  <SelectTrigger className='w-full my-1.5'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
            </SidebarGroup>
            <SidebarFooter>
              <Button variant="default" onClick={() => loadNotes(buildQuery())}>Apply</Button>
              <Button variant="secondary" onClick={() => {
                setFilterCategories([]);
                setFilterTags([]);
                setSearchQuery('');
                setSortBy('createdAt');
                setOrder('desc');
                loadNotes(); 
                // To check: Here we call the loadNote function without taking account for state, might lead to inconsistency.
                // If we call loadNotes(buildQuery()) it takes two clicks to reset
                // Thought: might need to add the filters as a dependency in useEffect Hook? --> currently called only during initial render
              }}
              >Reset Filters</Button>
            </SidebarFooter>
          </SidebarContent>
        </Sidebar>
        
        <div className='px-12 py-2 flex flex-col gap-2'>
          <div className='flex justify-between items-center w-full mt-12 pb-3 px-3 border-b-2'>
            <h1>Notes</h1>
            <div className='flex items-center gap-1'>
              <SidebarTrigger className='h-8 w-8'>
                <FilterIcon />
              </SidebarTrigger>
              
              <Dialog onOpenChange={(open) => {
                if (!open) {
                  setTitle(''); 
                  setBody('');
                  setSelectedCategoryIds([]);
                  setSelectedTagIds([]); 
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">Create note</Button>
                </DialogTrigger>
                <DialogContent className="w-[550px] flex flex-col gap-y-4">
                  <DialogHeader>
                    <DialogTitle>Create new note</DialogTitle>
                  </DialogHeader>
                  {/* Create new note form */}
                  <form onSubmit={handleCreate} className='w-full flex flex-col gap-y-3'>
                    <div>
                      <label className='my-2'>
                        Title
                      </label>
                      <Input
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                      >
                      </Input>
                    </div>
                    <div>
                      <label htmlFor="categories-create-select">
                        Categories (multiple selection)
                      </label>
                      <ScrollArea className=' max-h-40 overflow-y-auto'>
                        {allCategories.map((c)=>
                          (
                          <div key={c._id} className='flex items-center gap-2 h-8'>
                            <Checkbox 
                              id={`cat-select-create-${c._id}`}
                              checked={selectedCategoryIds.includes(c._id)}
                              onCheckedChange={(checked) => {
                                if(checked) {
                                  setSelectedCategoryIds([...selectedCategoryIds, c._id]);
                                } else {
                                  setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== c._id));
                                }
                              }}
                            />
                            <Label className="cursor-pointer font-normal" htmlFor={`cat-select-create-${c._id}`}>
                              {c.name}
                            </Label>
                          </div>))
                        }
                      </ScrollArea> 
                    </div>
                    <div>
                      <label htmlFor="tags-create-select">
                        Tags (multiple selection)
                      </label>
                      <ScrollArea className='max-h-40 overflow-y-auto'>
                          {allTags.map((t)=>
                            (
                            <div key={t._id} className='flex items-center gap-2 h-8'>
                              <Checkbox 
                                id={`tag-select-create-${t._id}`}
                                checked={selectedTagIds.includes(t._id)}
                                onCheckedChange={(checked) => {
                                  if(checked) {
                                    setSelectedTagIds([...selectedTagIds, t._id]);
                                  } else {
                                    setSelectedTagIds(selectedTagIds.filter(id => id !== t._id));
                                  }
                                }}
                              />
                              <Label htmlFor={`tag-select-create-${t._id}`} className="cursor-pointer font-normal">
                                {t.name}
                              </Label>
                              
                            </div>))
                          }
                      </ScrollArea> 
                    </div>
                    <div>
                      <Textarea
                        placeholder="Body (optional)"
                        value={body}
                        onChange={e => setBody(e.target.value)}
                      />
                    </div>
                    <Button type="submit" variant="default">
                      Create
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </div>
          <div className='flex flex-wrap w-full gap-3'>
            {notes.map(note => (
              <Card key={note._id} className='py-0 w-70 gap-4'>    
                <img className="w-full h-30 object-cover rounded-t-xl p-0" src="https://www.notion.so/images/page-cover/webb4.jpg" alt="note image default" />
                <CardHeader className='py-0 px-4 flex flex-col gap-2'>
                  <CardTitle className=''>{note.title}</CardTitle>
                  {/* <div>  
                    {Array.isArray(note.categories) ? note.categories.map(
                        (c, id) => <Badge variant="default" key={id} className='mx-0.5'>{c.name}</Badge>) 
                      : note.categories
                    }
                  </div> */}
                  <div className='h-10'>
                    {Array.isArray(note.tags) ? note.tags.map(
                      (t, id) => <Badge variant="outline" key={id} className='mx-0.5'>{t.name}</Badge>) 
                      : note.tags
                    }
                  </div>
                </CardHeader>
                <CardContent className='text-sm h-15 overflow-y-hidden'>
                  {note.body}  
                </CardContent>
                <CardFooter className='pt-2 py-4 items-baseline justify-between'>        
                    <div className='text-xs'>
                      {/* Converts date to date object and handles format */}
                      {new Date(note.createdAt).toLocaleString()}
                    </div>                 
                    <div className='flex gap-2'>
                    {/* Dialog to update the note */}
                    {editingNote && editingNote._id === note._id ? (
                    
                      <Dialog open={true} onOpenChange={(open) => {
                        if (!open) {
                          setEditingNote(null);
                          setEditSelectedCategoryIds([]);
                          setEditSelectedTagIds([]);
                        }
                      }}>
                          <DialogContent className="w-[550px] flex flex-col gap-y-4">
                            <DialogHeader>
                              <DialogTitle>Edit note</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className='w-full flex flex-col gap-y-3'>
                              <div>
                                <label className='my-4'>
                                  Title
                                </label>
                                <Input
                                  value={editingNote?.title ?? ''}
                                  onChange={e => setEditingNote({ ...editingNote, title: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <label htmlFor="categories-edit-select">
                                  Categories (multiple selection)
                                </label>
                                <ScrollArea className='max-h-40 overflow-y-auto'>
                                  {allCategories.map((c)=>
                                    (
                                    <div key={c._id} className='flex items-center gap-2 h-8'>
                                      <Checkbox 
                                        id={`cat-select-edit-${c._id}`}
                                        checked={editSelectedCategoryIds.includes(c._id)}
                                        onCheckedChange={(checked) => {
                                          if(checked) {
                                            setEditSelectedCategoryIds([...editSelectedCategoryIds, c._id]);
                                          } else {
                                            setEditSelectedCategoryIds(selectedCategoryIds.filter(id => id !== c._id));
                                          }
                                        }}
                                      />
                                      <Label className="cursor-pointer font-normal" htmlFor={`cat-select-edit-${c._id}`}>
                                        {c.name}
                                      </Label>
                                    </div>))
                                  }
                                  
                                </ScrollArea> 
                              </div>
                              <div>
                                <label htmlFor="tags-create-select">
                                Tags (multiple selection)
                                </label>
                                <ScrollArea className='max-h-40 overflow-y-auto'>
                                    {allTags.map((t)=>
                                      (
                                      <div key={t._id} className='flex items-center gap-2 h-8'>
                                        <Checkbox 
                                          id={`tag-select-edit-${t._id}`}
                                          checked={editSelectedTagIds.includes(t._id)}
                                          onCheckedChange={(checked) => {
                                            if(checked) {
                                              setEditSelectedTagIds([...editSelectedTagIds, t._id]);
                                            } else {
                                              setEditSelectedTagIds(editSelectedTagIds.filter(id => id !== t._id));
                                            }
                                          }}
                                        />
                                        <Label htmlFor={`tag-select-edit-${t._id}`} className="cursor-pointer font-normal">
                                          {t.name}
                                        </Label>
                                      </div>))
                                    }

                                </ScrollArea> 
                              </div>
                              <div>
                                <Textarea
                                  value={editingNote?.body ?? ''}
                                  onChange={e => setEditingNote({ ...editingNote, body: e.target.value })}
                                  style={{ width: '100%', padding: '0.25rem', marginTop: '0.25rem' }}
                                />
                              </div>      
                              <Button variant="default" type="submit" >Save</Button>
                              <Button variant="ghost" type="button" onClick={() => {
                                setEditingNote(null);
                                setEditSelectedCategoryIds([]);
                                setEditSelectedTagIds([]);
                                }}>Cancel</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ) : (
                            <Button variant="secondary" onClick={() => {
                              if(!note._id) {return ;} // To guard against invalid id before setting editing state

                              setEditingNote({_id: note._id, title: note.title, body: note.body});
                              setEditSelectedCategoryIds(Array.isArray(note.categories) ? note.categories.map(c => String(c._id)) : []);
                              setEditSelectedTagIds(Array.isArray(note.tags) ? note.tags.map(t => String(t._id)) : []);
                              }}>
                              <Pen />
                            </Button>
                          )}  
                    <Button variant="destructive" size='icon-sm' onClick={() => handleDelete(note._id)}>
                      <Trash />
                    </Button>
                  </div>            
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}


export default App;
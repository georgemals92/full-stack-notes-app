# 📘 Adding Categories and Tags to Notes (Backend + Frontend Guide)

## 🧭 Overview

This document describes how to extend the existing MERN notes application to support:

- **Categories**: a single string field (e.g., “Work”, “Personal”)
- **Tags**: an array of strings (e.g., `["urgent", "todo"]`)
- **Filtering, sorting, and search** across notes

---

# ✅ 1. Update the Mongoose Schema

```js
category: { type: String, default: '' },
tags: [{ type: String }],
```

---

# ✅ 2. Update Create Controller

```js
const { title, body, category, tags } = req.body;

const note = new Note({
  title,
  body,
  category: category || '',
  tags: Array.isArray(tags) ? tags : []
});
```

---

# ✅ 3. Update Update Controller

```js
const updated = await Note.findByIdAndUpdate(
  id,
  { title, body, category, tags },
  { new: true, runValidators: true }
);
```

---

# ✅ 4. Add Filtering, Sorting, and Search

```js
if (category) query.category = category;
if (tag) query.tags = tag;
if (search) {
  query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { body: { $regex: search, $options: 'i' } }
  ];
}
```

---

# ✅ 5. Frontend State

```js
const [category, setCategory] = useState('');
const [tags, setTags] = useState('');
```

### Filtering/search:

```js
const [filterCategory, setFilterCategory] = useState('');
const [filterTag, setFilterTag] = useState('');
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState('createdAt');
const [order, setOrder] = useState('desc');

```
+ add filters & search in jsx

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

---

# ✅ 6. Build Query URL


let query = '?';
if (filterTag) {query += `tag=${filterTag}&`};
if (filterCategory) {query += `category=${filterCategory}&`};
if (searchQuery) {query += `search=${searchQuery}&`};
query += `sortBy=${sortBy}&order=${order}`;

+ update loadNotes handler to accept queries
+ update getNote service to accept queries


```

---

# ✅ 7. UI Inputs

```jsx
<input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
<input placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
```

---

# ✅ 8. Recommended Implementation Order

1. Update schema  
2. Update backend controllers  
3. Update frontend create/edit  
4. Add filtering/search logic  
5. Add UI  

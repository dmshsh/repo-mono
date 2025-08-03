// src/App.js
import React, { useState, useEffect } from 'react';

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const API = 'http://localhost:4000';



  useEffect(() => {
    fetch(`${API}/articles`)
      .then(res => res.json())
      .then(setPosts)
      .catch(console.error);
  }, []);


  const handleAdd = async () => {
    if (!title || !content) return;
    const res = await fetch(fetch(`${API}/articles`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });
    if (res.ok) {
      const post = await res.json();
      setPosts([...posts, post]);
      setTitle('');
      setContent('');
    }
  };


  const startEdit = post => {
    setEditingId(post.id);
    setNewTitle(post.title);
    setNewContent(post.content);
  };

  const handleEdit = async id => {
    const res = await fetch(`${API}/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newTitle, newContent })
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts(posts.map(p => (p.id === id ? updated : p)));
      setEditingId(null);
    }
  };


  const handleDelete = async id => {
    if (!window.confirm('Delete this article?')) return;
    const res = await fetch(`${API}/articles/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>Articles</h1>

      <div style={{ marginBottom: 20 }}>
        <h2>Add New</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button onClick={handleAdd}>Add Article</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 12 }}>
            {editingId === post.id ? (
              <>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <button onClick={() => handleEdit(post.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <button onClick={() => startEdit(post)}>Edit</button>
                <button onClick={() => handleDelete(post.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

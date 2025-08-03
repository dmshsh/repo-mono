import express from 'express';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import cors from 'cors'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));
const DATA_FILE = path.join(__dirname, 'articles.xlsx');
function loadPosts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const workbook = xlsx.readFile(DATA_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  return rows.map(r => ({
    id: Number(r.id),
    title: r.title,
    content: r.content
  }));
}
function savePosts(posts) {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(posts, {
    header: ['id', 'title', 'content']
  });
  xlsx.utils.book_append_sheet(wb, ws, 'Articles');
  xlsx.writeFile(wb, DATA_FILE);
}

let posts = loadPosts();

app.get('/articles', (req, res) => {
  res.json(posts);
});

app.post('/articles', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const maxId = posts.reduce((max, p) => Math.max(max, p.id), 0);
  const newPost = {
    id: maxId + 1,
    title,
    content
  };

  posts.push(newPost);

  try {
    savePosts(posts);
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error saving XLSX:', err);
    res.status(500).json({ error: 'Failed to write to XLSX file' });
  }
});

app.put('/articles/:id', (req, res) => {
  const { id } = req.params;
  const { newTitle, newContent } = req.body;  
  const numId = Number(id);

  if (!newTitle || !newContent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const index = posts.findIndex(p => p.id === numId);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }

  posts[index].title = newTitle;
  posts[index].content = newContent;

  try {
    savePosts(posts);
    res.json(posts[index]);
  } catch (err) {
    console.error('Error saving XLSX:', err);
    res.status(500).json({ error: 'Failed to write to XLSX file' });
  }
});

app.delete('/articles/:id', (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const index = posts.findIndex(p => p.id === numId);
  if (index === -1) {
    return res.status(404).json({ error: 'Article not found' });
  }
  posts.splice(index, 1);
  posts = posts.map((post, idx) => ({
    id: idx + 1,
    title: post.title,
    content: post.content
  }));
  try {
    savePosts(posts);
    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error saving XLSX:', err);
    res.status(500).json({ error: 'Failed to write to XLSX file' });
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
import express from 'express';
import { Note } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all notes for user (optionally filtered by folder)
router.get('/', async (req, res) => {
  try {
    const { folderId, search } = req.query;
    const query = { userId: req.user._id };

    if (folderId) {
      query.folderId = folderId;
    }

    let notes;
    if (search) {
      notes = await Note.find({
        ...query,
        $text: { $search: search },
      }).sort({ isPinned: -1, updatedAt: -1 });
    } else {
      notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
    }

    res.json({ success: true, notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ success: true, note });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const { folderId, title, heading, content, tags } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: 'Folder ID is required' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = await Note.create({
      userId: req.user._id,
      folderId,
      title: title.trim(),
      heading: heading?.trim() || '',
      content: content || '',
      tags: tags || [],
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.patch('/:id', async (req, res) => {
  try {
    const { title, heading, content, tags, isPinned, folderId } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (heading !== undefined) updates.heading = heading.trim();
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    if (isPinned !== undefined) updates.isPinned = isPinned;
    if (folderId !== undefined) updates.folderId = folderId;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ success: true, note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Toggle pin
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({ success: true, note });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ error: 'Failed to toggle pin' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;

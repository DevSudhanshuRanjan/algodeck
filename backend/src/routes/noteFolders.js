import express from 'express';
import { NoteFolder, Note } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all folders for user
router.get('/', async (req, res) => {
  try {
    const folders = await NoteFolder.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    // Get note counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const noteCount = await Note.countDocuments({ 
          userId: req.user._id, 
          folderId: folder._id 
        });
        return {
          ...folder.toObject(),
          noteCount,
        };
      })
    );

    res.json({ success: true, folders: foldersWithCounts });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Create folder
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const folder = await NoteFolder.create({
      userId: req.user._id,
      name: name.trim(),
    });

    res.status(201).json({ success: true, folder });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update folder
router.patch('/:id', async (req, res) => {
  try {
    const { name } = req.body;

    const folder = await NoteFolder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name: name.trim() },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json({ success: true, folder });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete folder (and all notes in it)
router.delete('/:id', async (req, res) => {
  try {
    const folder = await NoteFolder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Delete all notes in the folder
    await Note.deleteMany({ folderId: req.params.id, userId: req.user._id });

    res.json({ success: true, message: 'Folder and notes deleted' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;

import express from 'express';
import { QuestionFolder, Question } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all folders for user
router.get('/', async (req, res) => {
  try {
    const folders = await QuestionFolder.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, folders });
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

    const folder = await QuestionFolder.create({
      userId: req.user._id,
      name: name.trim(),
    });

    res.status(201).json({ success: true, folder });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Add subfolder
router.post('/:id/subfolders', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Subfolder name is required' });
    }

    const folder = await QuestionFolder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        $push: { 
          subfolders: { name: name.trim() } 
        } 
      },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.status(201).json({ success: true, folder });
  } catch (error) {
    console.error('Add subfolder error:', error);
    res.status(500).json({ error: 'Failed to add subfolder' });
  }
});

// Update folder
router.patch('/:id', async (req, res) => {
  try {
    const { name } = req.body;

    const folder = await QuestionFolder.findOneAndUpdate(
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

// Delete folder (and all questions in it)
router.delete('/:id', async (req, res) => {
  try {
    const folder = await QuestionFolder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Delete all questions in the folder and its subfolders
    const subfolderIds = folder.subfolders.map(sf => sf._id.toString());
    await Question.deleteMany({ 
      userId: req.user._id,
      $or: [
        { folderId: req.params.id },
        { folderId: { $in: subfolderIds } }
      ]
    });

    res.json({ success: true, message: 'Folder and questions deleted' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;
